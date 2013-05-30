---
layout: post
title: Quand votre DB contient 70 tables ...
meta: Quelques stratégies pour couper le gras, réduire le nombre tables et améliorer les performances
---

Sur un des projets dont j'ai hérité, il y a 72 tables dans la base de données MySQL. La plus grosse table a 1,5 million d'enregistrements et les 26 plus petites tables en ont moins de 10. Beacuoup de ces tables n'ont pas lieu d'être.

## Les tables avec une seule ligne
Certaines tables comme `texte_a_propos` ou `texte_nous_joindre` ne contiennent qu'un seul enregistrement. Elles ont été créées pour des bouts de texte pouvant être modifié par le CMS.

Ces petits blocs de texte sont affichés à différents endroits sur le site, soit pour expliquer un formulaire, afficher des infos de contact ou apporter de l'information secondaire. 

Ils pourraient faire partie des *templates* car ils ne changent pas souvent (jamais?), mais j'imagine que quelqu'un a insisté pendant le développement pour avoir le contrôle de tout à partir du CMS ... *ok, fair enough*.

Si ont doit absolument garder ce contenu dans la BD, ces tables pourraient être fusionnées en une table unique `textes_statiques` (ou `textes_qui_ne_changent_jamais`), contenant une ligne pour chacun de ces blocs de texte.

Avec ce changement, on doit encore *hardcoder* la référence vers le bloc de texte (`SELECT * FROM textes_statiques WHERE id = 1`), ce qui n'est pas optimal, mais au moins on a nettoyé la liste des tables et enlevé de la redondance.

## Les tables avec < 10 lignes
D'autres tables sont là pour [normaliser la base de données](http://fr.wikipedia.org/wiki/Forme_normale_(bases_de_donn%C3%A9es_relationnelles)), des tables comme `usager_statut` ou `usager_type`. Ce que ces tables engendrent quand on fait nos requêtes? Des requêtes complexes, des jointures inutiles et un *hit* sur les performances.

Plusieurs de ces tables pourraient être une constante de classe, stocké dans un champ INT dans la table `usager`. Pour éviter de briser le code en place, on peut utiliser le # d'id comme valeur de constante.

``` php
class Usager
{
    const EN_ATTENTE = 0;
    const ACTIF      = 1;
    const SUPENDU    = 2;
    const SUPPRIME   = 3;
    // ...
}
```

Règle générale, les tables dont le contenu ne peut pas être géré par le CMS peuvent être remplacée de cette façon.

## Les tables avec beaucoup trop d'enregistrement
Il y a deux gigantesques tables, où s'ajoutent 40k à 50k lignes par semaines. Ce sont des tables pour le *tracking* d'envoi de courriels : combien ont été ouverts, quels liens ont été cliqués, etc.

Le nombre de lignes n'est pas extravagant pour une BD MySQL mais en ajoutant quelques jointures et des `COUNT` pour l'aggregation des statistiques dans le CMS, on obtient des performances assez médiocres qui, de semaines en semaines, deviendront de pire en pire.

Une base de données non-relationnelle comme [MongoDB](http://www.mongodb.org/) serait excellente pour ce genre de données et nous ferait gagner en performance de façon spectaculaire sur l'écriture. On a déjà remarqué que si beaucoup de gens ouvrent les courriels pendant un envoi, la base de données a un peu de misère à suivre.

Pour les statistiques dans le CMS, on peut executer un map/reduce à interval régulier pour faire l'aggrégation des données. On n'aura plus des chiffres en temps réel, mais l'affichage va être instantané.

## Réduire le nombre de jointures en dénormalisant
Il y a certains endroits sur le site où on affiche le nombre de relations d'un objet, par exemple le nombre de commentaires sur chacun des articles dans une liste. Ces totaux peuvent être stockés dans une colonne de la table `article` et mis à jour lors de l'ajout de commentaire.

Il est généralement préférable de perdre un peu sur les performance lors de l'écriture pour gagner lors de la lecture.

## Conclusion
Avec ces 3 stratégies, je passe de 72 tables à 40, avec peu de changements au niveau de la logique du code. Je sauve aussi quelques miliers de lignes de PHP en supprimant les classes utilisées par l'ORM pour *mapper* les tables à des objets PHP. J'augmente aussi la performance de l'application à plusieurs endroits.
