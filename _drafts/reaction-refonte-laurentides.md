---
layout: post
title: Réaction au nouveau site de Tourisme Laurentides
meta: Parce que si le web continue comme ça quelqu'un va se faire mal.
---

Tourisme Laurentides lançait dernièrement le nouveau look de son [site web](http://laurentides.com), refonte qui était méritée depuis bien longtemps ([voir le site à la fin avril](http://web.archive.org/web/20130429161615/http://www.laurentides.com/)).

Le résultat est très agréable à l'oeil et ça va faire du bien à la région d'avoir un site web à son image. Je dis donc chapeau à l'équipe qui a fait le design!

Ceci dit, au niveau de la programmation, ce n'est pas si rose. Les sites web sont souvent comme des icebergs, il y a la petite partie que l'on voit qui semble inoffensive et l'immense masse sous l'eau qui peut nous couler au fond.

## Performances
Les performances du site sont passables sur un ordinateur de bureau avec une bonne connexion et le rendent inutilisable sur un appareil mobile. La page principale nous accueille avec un *spinner* pendant plusieurs longues secondes comme à l'époque des sites en flash.

Après une centaine de requêtes HTTP et 8.4Mb de transfert, le site devient navigable. Le tout prend entre 5 et 10 secondes sur une connexion internet par câble.

En se fiant [aux statistiques](http://blog.kissmetrics.com/loading-time/) qui circulent à ce sujet, 40% des internautes vont avoir rebroussé chemin avant que la première page ne soit affichée.

Je vais toucher à différentes façon d'améliorer les performances en optimisant les images, les scripts, les feuilles de styles, le code HTML et les configurations serveur.

### Les images
Dans le haut de la page principale, il y a un carrousel de photos représentant la région dans les 4 saisons. Les images sont de très haute qualité et pèsent entre 837kb et 999kb chacune.

Les intégrateurs travaillaient probablement avec des téléviseurs de 40 pouces comme écran parce que les images ont une  dimensions de 2500x1648. Si on regarde les statistiques de la dernière année pour le [top 10 des résolutions d'écrans au Canada](http://gs.statcounter.com/#resolution-CA-monthly-201205-201305), on peut voir que mon écran de 1920x1080 est le plus gros, en 4e place de popularité.

Sachant ça, il semble abusif d'avoir des images de si grande taille qui, ironiquement, portent le suffixe *_optimised*. Optimisée pour quoi? Dépasser ma limite de bande passante? Si la majeure partie des visiteurs ont une résolution inférieure à 1920x1080, pourquoi avoir des images 30% plus grandes?

J'ai testé différents scénarios pour optimiser l'utilisation de la bande passante:
* J'ai réduit la qualité d'image de façon agressive (30%) sans changer la taille. Comme l'image est affichée plus petite, les artefacts ne sont pas aussi apparents, c'est une technique qui est est parfois utilisée pour fournir des images claires aux appareils HDPI. J'ai ensuite passé l'image dans [ImageOptim](http://imageoptim.com/) pour un résultat final de 492kb, une réduction de 51% par rapport à l'originale.
* J'ai réduit la taille de l'image à ma taille d'affichage (1905px) et j'ai réduit la qualité comme on le fait généralement en exportant pour le web (60%). J'ai ensuite optimisé l'image pour un résultat de 382kb, une réduction de 62%.
* J'ai réduit la taille à 1905px et réduit la qualité de façon un peu plus agressive (40%). Un fois optimisée, j'obtient une image de 292kb, pour 71% d'amélioration. Des artefacts un peu plus apparent commencent à apparaitre dans les couleurs à plat comme le ciel, qui est heureusement caché par le menu.

Juste en optimisant les images du carrousel et les images de fond de façon intelligente, on peut sauver tout près de 6Mb, en l'espace de seulement 5-10 minutes, sans toucher à une ligne de code.

Ensuite, comme Brad Frost [en a déjà parlé](http://bradfrostweb.com/blog/post/carousels/) à de nombreuses reprises, les carrousels sont rarement un bon choix: Pourquoi faire charger 4 gigantesques images à des internautes qui ne verront probablement que la première? En chargeant les images des autres saisons au clic plutôt qu'au chargement de la page, on réduit de 75% la bande passante utilisée par le *slider*.

Avec les images que j'ai optimisées, on sauve près de 900kb supplémentaires en ne pré-chargeant pas les images 2 à 4 du carrousel. La page est passée de 8.4Mb au départ à 1.6Mb en ne touchant qu'aux images, et en réduisant un peu les requêtes HTTP au passage.

Ensuite, on pourrait remplacer les images servant à faire le dégradé dans le menu en haut (au nombre de 5) par un dégradé CSS.

Il y a ensuite les 3 icônes dans la section "Quoi faire?" de la page et les 4 icônes de médias sociaux dans le bas de page qu'on pourrait regrouper dans une seule *sprite*. Si on est vraiment en forme on pourrait même y ajouter les 4 logos tout en bas et la flèche noire qui sert à ouvrir le pied de page.

Avec notre *sprite*, on a remplacé 16 images par une seule, réduisant passablement le nombre de requêtes HTTP.

### Les scripts
Sur l'index, il y a en tout 34 fichier javascripts pour un total de 389kb. La plupart de ces fichiers ne sont pas *minifiés*, et certains de ces script peuvent être réduit de 40-50% en utilisant un outil comme [YUI Compressor](http://yui.github.io/yuicompressor/) de Yahoo! ou même [CodeKit](http://incident57.com/codekit/).

En passant les scripts de plus de 10kb dans YUI, je suis passé de 304kb à 231kb, une réduction facile de 24%. Tous les fichiers javascripts en production devraient être *minifiés*, ça fait partie d'un bon processus de *release*.

La configuration de leur serveur apache applique la compression gzip sur les fichiers HTML et CSS mais pas sur les JS. Sur les 250kb de javascript qu'il nous reste, on peut sauver encore 60-75% avec gzip, pour un résultat final de 70kb. La page passe de 1.6Mb à 1.3Mb après avoir optimisé un peu le JS.

En plus de *minifier* et compresser, on peut faire une concaténation des fichiers pour réduire le nombre de requêtes HTTP. De ces 34 fichiers, la moitié au moins pourrait être regroupée ensemble en un seul fichier.

On pourrait ensuite se poser la question si tous ces fichiers là sont vraiment nécessaires sur la page d'accueil, on peut probablement couper dans le gras encore plus.

La dernière chose en faire, c'est de prendre ce qui nous reste de fichiers javascript et de les déplacer dans le code HTML jusqu'en bas avant la balise `</body>`. Comme les scripts ont un effet bloquant sur le rendu de la page, on va grandement améliorer la performance perçue.

### Les feuilles de style
C'est la partie qui a le moins manqué d'attention dans le développement, tous les fichiers CSS sont *minifiés* et compressés avec gzip. La seule chose à faire serait de regrouper les 6 fichiers en 1.

Si on veut vraiment pousser, on peut regarder quelle partie du CSS est vraiment utilisée sur la page d'accueil et enlever le reste. Il y a 83% du CSS qui n'est pas utilisé sur l'index, mais comme c'est un petit gain (~25kb) pour possiblement beaucoup de travail, on est mieux de mettre l'énergie ailleurs.

### Architecture
Ce que je trouve dommage en 2013 de la part des sites qui utilisent beaucoup JavaScript pour des effets visuels, c'est qu'ils sont souvent inutilisables sans. Comme il y a 2% des internautes Nord-Américains qui naviguent avec JavaScript désactivé, on perd 2000 visiteurs par tranches de 100 000. C'est 2% de revenu perdu à cause d'un mauvais choix d'architecture au début d'un projet.

Deux principes en développement web nommés [Progressive enhancement](http://en.wikipedia.org/wiki/Progressive_enhancement) et Graceful degradation dictent qu'un site doit être utilisable par le plus petit dénominateur. L'expérience n'as pas nécessairement à être la même pour tout le monde mais elle doit permettre au visiteurs d'utiliser le site.

Sans javascript, le menu principal n'apparait pas, et le texte du carrousel photo non plus. C'est le genre d'animation qui pourrait être fait avec les transitions CSS au lieu de JS, rendant ainsi le site beaucoup plus accessible. Les navigateurs sans JS devraient recevoir la même attention que les vieux navigateurs (IE <= 8).

## Conclusion
En peu de temps et avec quelques techniques simples, la page de 104 requêtes HTTP et 8.4Mb qu'on avait au départ se limite maintenant à 59 requêtes et 1.6Mb, ce qui est encore élevé mais beaucoup plus raisonnable.

Ces changements ont amélioré les performances du site, ce qui réduit le taux d'abandon, le taux de rebond, et qui se traduit en plus de visites et plus de revenus.

Idéalement, c'est le genre de considération qu'on doit avoir avant même d'avoir écrit une ligne de code, on doit avoir cette discussion avant même l'étape du design.

J'aime bien l'idée d'avoir un [budget performance](http://timkadlec.com/2013/01/setting-a-performance-budget/), où on se donne des limites, comme 75 requêtes HTTP, 800kb de tranfert au total, ou un temps de chargement inférieur à 2 secondes.

Avoir des contraintes nous pousse à faire des choix sensés et à décider de ce qui est vraiment important dans une page web. Avoir des limites nous force à être créatifs dans nos solutions: est-ce qu'on a vraiment besoin de jQuery (90kb) pour faire bouger 2-3 trucs dans la page ou bien on peut le faire en JS vanille, ou même avec CSS?

Voici en lien quelques lectures pour pousser l'exercice encore plus loin:
- ["Front-end performance" par Harry Roberts](http://csswizardry.com/2013/01/front-end-performance-for-web-designers-and-front-end-developers/)
- ["Performance as Design" par Brad Frost](http://bradfrostweb.com/blog/post/performance-as-design/)
- ["Browser diet" - 25 étapes pour améliorer la performance d'un site](http://browserdiet.com/)

Voici quelques outils pour évaluer la performance d'un site web:
- ["Page speed insights" par Google](https://developers.google.com/speed/pagespeed/insights)
- ["YSlow" par Yahoo!](http://developer.yahoo.com/yslow/)
- [L'onglet audit dans Chrome](http://www.html5rocks.com/en/tutorials/developertools/auditpanel/)
