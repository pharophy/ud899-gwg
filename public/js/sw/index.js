import 'babel-polyfill';

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
    caches.open('wittr-static-v1').then((cache) => {
      cache.addAll(cacheIndex);
    })
  );

});

const cachedResource = async (request) => {
  const cache = await caches.open('wittr-static-v1')
  let response = await cache.match(request);
  if (response) {
    return response;
  } else {
    return await fetch(request);
  }
}

self.addEventListener('fetch', (event) => {
  
  console.log(event);
  event.respondWith(cachedResource(event.request));
  
});