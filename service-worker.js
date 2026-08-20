const CACHE_NAME = "cyber-binary-lab-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./manifest.json"
];


// Install
self.addEventListener("install", (event) => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(FILES_TO_CACHE);
            })
    );

    self.skipWaiting();
});


// Activate
self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys().then((cacheNames) => {

            return Promise.all(

                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))

            );

        })

    );

    self.clients.claim();
});


// Fetch
self.addEventListener("fetch", (event) => {

    event.respondWith(

        caches.match(event.request)
            .then((cachedResponse) => {

                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((response) => {

                        if (
                            !response ||
                            response.status !== 200 ||
                            response.type === "opaque"
                        ) {
                            return response;
                        }

                        const responseClone =
                            response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(
                                    event.request,
                                    responseClone
                                );
                            });

                        return response;
                    });

            })
            .catch(() => {

                return caches.match("./index.html");

            })

    );
});
