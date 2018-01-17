self.addEventListener('fetch', function(event) {
  
  console.log(event.request);
  if (event.request.url.indexOf('.jpg') > -1) {
    event.respondWith(
      fetch('/imgs/dr-evil.gif')
    );
    console.log('responded with dr evil!');
  }
  
});