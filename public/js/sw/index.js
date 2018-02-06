import 'babel-polyfill';

let staticCacheName = 'wittr-static-v3';

self.addEventListener('install', (event) => {

  const cacheIndex =  [
    '/',
    '/js/main.js',
    'css/main.css',
    'imgs/icon.png',
    'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
    'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
];

  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      cache.addAll(cacheIndex);
    })
  );

});

const cachedResource = async (request) => {
  const cache = await caches.open(staticCacheName)
  let response = await cache.match(request);
  if (response) {
    return response;
  } else {
    return await fetch(request);
  }
};

self.addEventListener('fetch', (event) => {
  
  console.log(event);
  event.respondWith(cachedResource(event.request));

});

const filterCacheNames = async (event) => {
  let keys = await caches.keys();
  console.log(keys);
  keys = keys.filter(key => key.startsWith('wittr-') && key != staticCacheName);
  keys.map(key => {
    return caches.delete(key);
  });
  
};

self.addEventListener('activate', (event) => {
  event.waitUntil(filterCacheNames());
});