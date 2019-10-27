---
layout: default
---

# It looks like you're offline!

We can't connect to [marcaube.ca](https://marcaube.ca) at the moment, and we haven't saved this page for offline reading.

But that's okay! Here are a few posts we _have_ saved for offline reading:

<ul id="history"></ul>
<script>
    caches.open('pages').then(cache => {
        cache.keys().then(keys => {
            let markup = ''

            // Loop through all the pages in the cache
            keys.forEach(request => {
                // Build a link to each page
                markup += `<li><a href="${request.url}">${request.url}</a></li>`
            })

            // Display the list of links
            document.getElementById('history').innerHTML = markup
        })
    })
</script>
