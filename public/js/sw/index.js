import 'babel-polyfill';
//test 10
let staticCacheName = 'wittr-static-v4';

self.addEventListener('install', (event) => {

  const cacheIndex =  [
    '/skeleton',
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
  const cache = await caches.open(staticCacheName);
  let response = null;
  const requestUrl = new URL(request.url);
  if (requestUrl.origin === location.origin && requestUrl.pathname === '/') {
    response = await cache.match('/skeleton');
  } else {
    response = await cache.match(request);
  }

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

self.addEventListener('message', (event) => {

  if (event.data.reload) {
    self.skipWaiting();
  }
});

//test refresh with comment 19