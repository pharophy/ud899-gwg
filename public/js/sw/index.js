self.addEventListener('fetch', function(event) {
  console.log('HTTP Request captured: ', event.request);
});