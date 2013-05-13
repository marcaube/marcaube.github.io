---
layout: post
title: Suite: Performance web et publicités
meta: Solution javascript à mon problème de perfs
---
Suite à [mon billet](/2013/04/performances-et-pubs/) sur un problème de *perf* relié à l'affichage de publicités, j'ai beaucoup cogité et j'ai fini par écrire une solution en JS.

## Définir une zone
Sur une page, il peut y avoir plusieurs zones publicitaires, avec un format IAB qui leur est propre, comme un *"Leaderboard"* (728x90) ou un *"Skyscraper"* (160x600).

Je définis donc un div conteneur, qui recevra une publicité une fois la page chargée :

``` html
<div class="pub"></div>
```

Ensuite, je spécifie à l'aide d'un *data-attribute* le format de pub à récupérer pour remplir ce conteneur :

``` html
<div class="pub" data-format="leaderboard"></div>
```

Comme le div n'a pas de contenu au chargement de la page, sa hauteur est zéro. Pour éviter un *reflow* lorsqu'on va y ajouter une pub, on peut spécifier directement la hauteur du div, selon le format qu'on va y mettre :

``` html
<div class="pub" data-format="leaderboard" style="height:90px"></div>
```

Finalement, comme une zone pub apparait sur plusieurs pages, et qu'on peut spécifier une pub différente selon la page, on doit pouvoir spécifier la page en cours. On peut soit récupérer l'URL de la page en JS ou passer un autre *data-attribute* qu'on remplis dans notre template :

``` html
<div class="pub" data-format="leaderboard" data-page="{{ page }}" style="height:90px"></div>
```

## Le javascript
Avant la balise fermante du `body`, on peut ajouter le code jQuery suivant :

```
<script defer type="text/javascript">
    $(function(){
        $('.pub').each(function(){
            var ad = $(this),
                format = ad.data('format'),
                page = ad.data('page');

            $.get('/pub/' + format + '/' + page, function(data){
                ad.html(data);
                ad.css('height', 'auto');
            });
        });
    });
</script>
```

Ce code boucle sur les éléments `.pub` dans la page et récupère le format, la page et fait une requête à un URL `/pub/{format}/{page}`.

Cette requête retourne du code HTML contenant soit une image avec un lien, soit un objet flash. Le code JS remplis le conteneur avec ce fragment de code et remplace l'attribut `height` qu'on avait spécifié au départ pour permettre aux pubs d'être *responsive*.

Si on n'a pas déjà jQuery dans la page, on peut facilement sauver 30kb en écrivant le code en *JS vanille* ou en utilisant une librairie plus légère (<10k) comme [Zepto](http://zeptojs.com).

Voici ce que ça donnerait en *JS vanille* (<1kb). Je ne suis pas programmeur JS alors le code suivant peut surement être amélioré ! Je l'ai testé dans IE 6-7-8 et il foncitonne bien.

``` js
<script type="text/javascript">
    // $.get()
    xhrGet = function(url, callback) {
        var xhr;
        try { // IE7+, Firefox, Chrome, Opera, Safari
            xhr = new XMLHttpRequest();
        } catch (e) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) { // IE6
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
        xhr.open("GET", url, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                callback(xhr.responseText)
            }
        }
        xhr.send(null)
    }

    // polyfill pour querySelectorAll dans IE <= 7 (source: https://gist.github.com/connrs/2724353)
    if (!document.querySelectorAll) {
        document.querySelectorAll = function(selector) {
            var doc = document,
                head = doc.documentElement.firstChild,
                styleTag = doc.createElement('STYLE');
            head.appendChild(styleTag);
            doc.__qsaels = [];

            styleTag.styleSheet.cssText = selector + "{x:expression(document.__qsaels.push(this))}";
            window.scrollBy(0, 0);

            return doc.__qsaels;
        }
    }

    // $('.pub')
    var ads = document.querySelectorAll('.pub');

    // $.each()
    for (var i = 0; i < ads.length; i++) {
        var ad = ads[i],
            format = ad.dataset.format,
            page = ad.dataset.page;

        // Fonction anonyme pour garder le contexte de l'object ad
        (function(el){
            xhrGet('/pub/' + format + '/' + page, function(data) {
                el.innerHTML = data;
                el.style.height = 'auto';
            });
        })(ad);
    }
</script>
```

