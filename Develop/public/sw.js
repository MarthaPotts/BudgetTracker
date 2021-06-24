
var urlsToCache = [
    '/',
    '/db.js', 
    '/index.js',
    '/manifest.json',
    '/styles.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
]; 
const CACHE_NAME = 'budget-tracker-cache-v1'; 
const DATA_CACHE_NAME = 'data-cache-v1'; 

//install 
self.addEventListener('install', function(event){
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Your files were pre-cached successfully'); 
            return cache.addAll(urls_Cache); 
        })
    ); 
    // self.skipWaiting(); 
}); 
//activation 
// self.addEventListener('activate', function(event) {
//     event.waitUntil(
//         caches.keys().then(keyList => {
//             return Promise.all(
//                 keyList.map(key => {
//                     if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
//                         console.log('removing old cahe data', key); 
//                         return caches.delete(key); 
//                     }
//                 })
//             ); 
//         })
//     ); 
//     self.clients.claim(); 
// }); 

//use fetch 
self.addEventListener('fetch', function(event) {
    if(event.request.url.includes('/api/')) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request).then(response => {
                    if (response.status === 200) {
                        cache.put(event.request.url, response.clone()); 
                    }
                    return response; 
                }).catch( (err) => {
                    return cache.match(event.request); 
                }); 
            }).catch( (err) => console.log(err))
        ); 
        return; 
    }
    event.respondWith(
        fetch(event.request).catch(function() {
        return caches.match(event.request).then(function(response) {
            if(response) {
            return response; 
            } else if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/'); 
            }
        }); 
    })
    ); 
}); 