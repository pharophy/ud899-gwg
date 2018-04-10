import 'babel-polyfill';
//test 10
let staticCacheName = 'wittr-static-v6';
let contentImgsCache = 'wittr-content-imgs';
var allCaches = [ staticCacheName, contentImgsCache];

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

  if (requestUrl.pathname.startsWith('/photos/')) {
    const imgCache = await caches.open(contentImgsCache);
    response = await servePhoto(request, imgCache);
  }

  if (response) {
    return response;
  } else {
    return await fetch(request);
  }
};

//TODO: lesson 12. Quiz: Cleaning Photo Cache Quiz

async function servePhoto(request, cache) {
  let storageUrl = request.url.replace(/-\d+px\.jpg$/, '');
  let cachedImage = await cache.match(storageUrl);
  if (cachedImage) {
    return cachedImage;
  } else {
    let response = await fetch(request);
    cache.put(storageUrl, response.clone()); //can only read response once, so have to clone it
    return response;
  }
}

self.addEventListener('fetch', (event) => {
  
  console.log(event);
  event.respondWith(cachedResource(event.request));

});

const filterCacheNames = async (event) => {
  let keys = await caches.keys();
  console.log(keys);
  keys = keys.filter(key => key.startsWith('wittr-') && !allCaches.includes(key));  //handler for both static & imgs cache
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