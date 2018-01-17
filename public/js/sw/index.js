self.addEventListener('fetch', function(event) {
  console.log('HTTP Request captured: CHANGED CONTENT', event.request);
});