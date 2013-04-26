---
layout: post
title: Pourquoi utiliser Jekyll.rb et Github Pages ?
meta: Les raisons pourquoi j'ai choisi d'utiliser un générateur de pages statiques pour mon site perso...
---

## Mon aventure avec un *super* hébergeur
L'aventure de mon site web commence avec l'achat d'un nom de domaine et d'un forfait d'hébergement chez un hébergeur très populaire, dont je vais taire le nom.

À force de travailler dans le web, on apprend qu'on n'a pas grand chose pour notre argent avec les hébergements partagés: un accès console limité, une limite sur le nombre de comptes courriel, peu de contrôle sur les configuration et les versions des logiciels installés. En gros l'hébergement partagé c'est l'enfer pour un développeur.

À la base, j'allais probablement utiliser [Symfony2](http://symfony.com) pour faire mon site. C'est un *framework* que j'utilise à tous les jours. Ça allait me permettre de tester des modules perso en production, m'aider à peaufiner mon code tout en améliorant mon site perso.

L'idée semblait bonne à la base, jusqu'au jour où j'ai essayé de mettre en ligne. Symfony sur un hébergement mutuel **sans console** c'est un défi insurmontable. Ne voulant pas retourner à l'âge du FTP et des mises en ligne manuelles, j'ai changé d'idée.

## Changement de cap
J'essaie d'utiliser [Github]() de plus en plus, dans mon travail mais aussi pour mes projets personnels. Ça devient une sorte de porte-folio de mon code en plus de me mettre en contact avec d'autre développeurs.

En tant qu'utilisateur de code open-source, ça semble seulement naturel d'essayer de redonner un peu à la communauté quand c'est possible. L'open-source fonctionne sur ce principe.

Github utilise [Jekyll](http://jekyllrb.com) pour générer ses [pages statiques](http://pages.github.com). On peut ainsi écrire de la documentation pour ses projets ou même, comme dans le cas présent, l'utiliser pour un site web.

> Il ne faut pas juger un livre à sa couverture.

Il faut garder en tête ce dicton en visitant le site de Jekyll pour la première fois, et le répéter comme un mantra. Une fois le choc initial surmonté, on peut plonger dans [la doc](https://github.com/mojombo/jekyll/wiki) qui couvre tout ce qu'il y a à savoir.

J'ai donc décidé d'apprendre à utiliser *encore* un autre outil...

## La bête
Jekyll est un programme écrit en Ruby. Il utilise un langage de  template nommé [Liquid](https://github.com/Shopify/liquid), dont la syntaxe ne devrait pas dépayser les utilisateurs de Twig, Jinja et compagnie.

Le contenu peut être écrit avec Markdown ou Textile, et Jekyll offre plusieurs options pour un site de type blog comme les tags, les catégories et la pagination.

Il y a aussi [une tonne de *plugins*](https://github.com/mojombo/jekyll/wiki/Plugins) au cas où les fonctionnalités de base ne soit pas suffisantes. Il est bon de noter par contre que Github ne supporte pas les *plugins* pour des raisons de sécurité, alors il faut générer les pages localement avant de les pousser sur Github.

## Donc pourquoi avoir utilisé Jekyll?
- Pour apprendre à l'utiliser, ce qui peut être très utile sur Github
- Pour héberger mon site directement sur Github et ainsi rendre le code disponible. Github devient aussi mon *CMS*, ce qui est plutôt bien
- Parce que c'est facile de migrer le contenu vers autre chose le jour où je veux changer

J'avais aussi pensé utiliser [Silex](http://silex.sensiolabs.org), mais ça reste plus proche de ma zone de confort, et quand on veut apprendre il faut en sortir. Je voulais aussi absolument annuler mon forfait d'hébergement pour pouvoir aller ailleurs, endroit que je n'ai pas encore trouvé.