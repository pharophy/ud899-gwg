self.addEventListener('install', (event) => {
  var urls = [
    '/',
    '/js/main.js',
    'css/main.css',
    'imgs/icon.png',
    'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
    'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
  ];
  
  event.waitUntil(
    caches.open('wittr-static-v1').then((cache) => {
      cache.addAll(urls);
    })
  );

});

self.addEventListener('fetch', function(event) {
  
  console.log(event);
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.status === 404) {
        console.log(response, ' failed');
        return fetch('/imgs/dr-evil.gif');
      }
      return response;
    }).catch((error) => {
      console.log(error);
      return new Response("Uh oh, something's wrong.");
    })
  );
  
});