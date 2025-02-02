const CACHE_NAME = "qr-code-reader-v2";
const urlsToCache = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js"
];

//Install Service Worker and Cache Required Files
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            await cache.addAll(urlsToCache);

            // Dynamically fetch and cache QR Scanner library
            try {
                const qrScannerResponse = await fetch("https://unpkg.com/qr-scanner@1.4.2/qr-scanner.min.js");
                if (qrScannerResponse.ok) {
                    const qrScannerClone = qrScannerResponse.clone();
                    cache.put("https://unpkg.com/qr-scanner@1.4.2/qr-scanner.min.js", qrScannerClone);
                }
            } catch (error) {
                console.error("Failed to cache QR Scanner library:", error);
            }
        })
    );
});

//Fetch event: Serve from cache when offline, fallback to network
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                return caches.match("/index.html"); // Fallback to main page if offline
            });
        })
    );
});

//Clear old caches on activation
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Deleting old cache:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
