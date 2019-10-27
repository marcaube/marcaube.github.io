const version = '201910271138'
const offlinePage = '/offline'

const staticCacheName = version + '_staticfiles'
const imageCacheName = version + '_images'
const cacheList = [
    staticCacheName,
    imageCacheName,
]

// Install the service worker and pre-cache top-level pages
addEventListener('install', installEvent => {
    installEvent.waitUntil(
        caches.open(staticCacheName).then(staticCache => {
            return staticCache.addAll([
                // Pages
                offlinePage,
                '/',
                '/articles',
                '/books',

                // Styling
                // TODO: add font files
                '/assets/css/style.css',
                '/assets/css/syntax.css',

                // Scripts
                // TODO: add JS files served from CDNs
                '/assets/js/modernizr.custom.15390.js',
                '/assets/js/dropcap.min.js',
                '/assets/js/responsive-nav.min.js',
                '/assets/js/scripts.js',
                '/assets/img/workstation.jpg',
            ])
        })
    )
})

// Clean-up old cache files when activating a new SW version
addEventListener('activate', activateEvent => {
    activateEvent.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheList.includes(cacheName)) {
                        return caches.delete(cacheName)
                    }
                })
            ).then(() => {
                return clients.claim()
            })
        })
    )
})

// Hijack the fetch event, to cache requested files and fallback to an offline experience when network is unavailable
addEventListener('fetch', event => {
    const request = event.request

    // When the user requests an HTML file...
    //      1. try the network (and add the file to cache);
    //      2. try the cache next;
    //      3. finally fallback to the offline page.
    if (request.headers.get('Accept').includes('text/html')) {
        event.respondWith(
            fetch(request).then(response => {
                // Cache the response
                let copy = response.clone()
                event.waitUntil(
                    caches.open(staticCacheName).then(staticCache => {
                        return staticCache.put(request, copy)
                    })
                )

                // Return the response from the network
                return response
            }).catch(error => {
                // Try a match from the cache, or fallback to the offline page
                return caches.match(request).then(response => response || caches.match(offlinePage))
            })
        )

        return
    }

    // When the user requests an image file...
    //      1. try the cache (for performance);
    //      2. try the network (and add the file to cache);
    //      3. finally fallback to an SVG placeholder image.
    if (request.headers.get('Accept').includes('image')) {
        event.respondWith(
            caches.match(request).then(response => {
                // Return the response from the cache
                if (response) {
                    return response
                }

                // Fetch the image from the network
                return fetch(request).then(response => {
                    // Cache the response
                    let copy = response.clone()
                    event.waitUntil(
                        caches.open(imageCacheName).then(imageCache => {
                            return imageCache.put(request, copy)
                        })
                    )

                    // Return the response from the network
                    return response
                }).catch(error => {
                    // Serve an SVG placeholder
                    return new Response('<svg role="img" aria-labelledby="offline-title" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title id="offline-title">Offline</title><g fill="none" fill-rule="evenodd"><path fill="#D8D8D8" d="M0 0h400v300H0z"/><text fill="#9B9B9B" font-family="Helvetica Neue,Arial,Helvetica,sans-serif" font-size="72" font-weight="bold"><tspan x="93" y="172">offline</tspan></text></g></svg>', {headers: {'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store'}})
                })
            })
        )

        return
    }

    // For everything else...
    //      1. look for a cached copy;
    //      2. fetch from the network.
    event.respondWith(
        caches.match(request).then(response => {
            if (response) {
                return response
            }

            return fetch(request)
        })
    )
})
