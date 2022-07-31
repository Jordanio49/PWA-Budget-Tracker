const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./css/styles.css",
    "./js/db.js",
    "./js/index.js",
    // "./manifest.json"
    "./icons/icon-72x72.png",
    "./icons/icon-96x96.png",
    "./icons/icon-128x128.png",
    "./icons/icon-144x144.png",
    "./icons/icon-152x152.png",
    "./icons/icon-192x192.png",
    "./icons/icon-384x384.png",
    "./icons/icon-512x512.png",
];

// caching resources
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});

// activating and deleting outdated caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keyList => {
            let cacheKeepList = keyList.filter(key => {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeepList.push(CACHE_NAME);

            return Promise.all(keyList.map(key, i => {
                if (cacheKeepList.indexOf(key) === -1) {
                    console.log('Deleting cache: ' + keyList[i]);
                    return caches.delete(keyList[i]);
                }
            }));
        })
    )
});

self.addEventListener('fetch', e => {
    console.log('Fetch request: ' + e.request.url);
    e.respondWith(
        caches.match(e.request).then(request => {
            if (request) {
                console.log('Responding with cache: ' + e.request.url);
                return request;
            } else {
                console.log('File is not cached, fetching: ' + e.request.url);
                return fetch(e.request);
            }
        })
    )
});