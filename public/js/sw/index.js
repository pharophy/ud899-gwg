self.addEventListener('fetch', function(event) {
  event.respondWith(
    new Response("My string <b class=\"a-winner-is-me\">hello world</b>", {
      headers :{
        'Content-Type' : 'text/html'
      }
    })
  );
});