---
layout: post
title: Performance web et publicités
meta: Billet sur un problème de performances sur un site Symfony et pistes de solutions
---

## Préambule
Ces derniers temps, j'ai été confronté à un problème de performance sur le site d'un client. Le site est développé avec [Symfony2](http://symfony.com/), utilise l'ORM [Doctrine2](http://www.doctrine-project.org/), il est responsive, utilise [adaptive-images](http://adaptive-images.com/) pour servir des images optimisées, etc etc.

Jusque là, le site avait été optimisé pour mettre en cache les requêtes à la base de données (Query & Result cache), mettre en cache des fragment de *template* (avec les ESI) et utiliser au mieux les entêtes HTTP pour mettre en cache les pages du côté client.

Les résultats de ces mises en cache granulaires était un temps de chargement entre 60ms pour une cache navigateur *primée* et ~150-200ms quand il y avait un hit sur l'application, parce que la plupart du temps il n'y avait aucun *hit* sur la base de données.

## Le problème
Le problème est arrivé quand le client a décidé d'ajouter des publicités sur son site. Ne voulant pas utiliser un *ad-network* existant, le client opte plutôt pour un module de gestion de publicité à même le site. La gestion de publicité devient un nouveau module dans son CMS.

Voici donc le problème : on ne peut plus mettre en cache les pages dans le navigateur ni mettre en cache le rendu final des *templates* à cause des pubs.

En plus, chaque fois qu'une page est affichée, on doit incrémenter le compteur d'impressions des 2 ou 3 publicités sur la page. Il y a donc en plus d'un *hit* sur l'application, plusieurs *hits* sur la base de données.

On parle de 3 à 6 requêtes pour récupérer les pubs (prendre la pub pour la page en cours, sinon *fallback* sur une pub globale) et 3 requêtes pour incrémenter le compteur d'impression (En vrai Doctrine fait 9 requêtes : `START TRANSACTION` -> `UPDATE` -> `COMMIT` x 3). Il y a donc dans le pire cas 15 requêtes à la BD pour afficher 3 pubs et 12 dans le meilleur cas.

Comme les pubs sont affichées dans des fragments séparés, on ne peut pas regrouper les requête dans une même transaction.

On passe maintenant à un temps de chargement moyen de 500-600ms, une fois que la cache de la base de données est *primée*, sinon c'est quelques secondes.

Une fois qu'on passe sur mobile, le temps de chargement se compte en secondes. Beaucoup d'efforts jetés à l'eau pour quelques pubs...

## Une piste de solution
Au lieu de mettre les pubs dans un fragment de *template*, il pourrait y avoir un API permettant de demander la pub (l'image) à l'aide d'un URL x-y-z. L'URL devrait être unique à chaque zones (selon la page, l'endroit dans la page, le format, etc.) et la pub affichée pour un même URL changerait dans le temps.

Ex: `pattern: /bannieres/{page}/{format}/{zone}`

Il faudrait ensuite spécifier que les images derrière cet URL sont *non-cacheable*. Encore mieux, servir ces images à partir d'un sous-domaine sans cookies où rien n'est mis en cache.

Ça semble bien non ? Oui mais non. Ça règle le problème de l'image mais pas du lien qui va avec (ou du fragment de template)... Ça, c'est du code qui doit changer selon la pub qui est affiché, alors on ne peut toujours pas utiliser la cache du navigateur.

## Solution JS
Ensuite, on pourrait contourner le problème en AJAX, comme le font Google et compagnie.

On peut réutiliser le même API qu'on avait définit dans notre *routing*, et au lieu de retourner directement une image, on retourne le fragment de HTML qu'on affichait au départ dans un ESI.

Le problème de cette solution c'est qu'on se repose sur javascript (près de 10% des visiteur du site en question ont JS désactivé), qu'on double les requêtes HTTP (1 pour le fragment, 1 pour l'image une fois le fragment *parsé* par le navigateur) et on augmente le temps de chargement de la page.

Mais, comme les publicités sont du contenu secondaire (peut-être pas pour les annonceurs mais du moins pour les visiteurs), on peut utiliser des astuces JS comme async, defer et même utiliser [head.js](http://headjs.com/) ou [require.js](http://requirejs.org/) pour faire tout ça après le chargement du contenu ou seulement sous certaines conditions.

## Conclusion
Je n'ai pas trouvé de solution parfaite, et peut-être qu'il n'y en a pas non plus. Je vais probablement opter pour la solution JS qui n'empêche pas le reste du contenu de s'afficher. Si la page se charge en 60ms et que les pubs n'apparaissent qu'après 300ms, c'est très bien pour moi.
