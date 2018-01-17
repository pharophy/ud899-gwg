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