# Wittr

This is a silly little demo app for an offline-first course.

You could run the app either using machine dependnecies, or using docker

## Running using local machine

### Installing

Dependencies:

* [Node.js](https://nodejs.org/en/) v0.12.7 or above

Then check out the project and run:

```sh
npm install
```

### Running

```sh
npm run serve
```

### Using the app

You should now have the app server at [localhost:8888](http://localhost:8888) and the config server at [localhost:8889](http://localhost:8889).

You can also configure the ports:

```sh
npm run serve -- --server-port=8000 --config-server-port=8001
```

## Running using docker

```sh
docker-compose up
```

Here also you should have the app server at [localhost:8888](http://localhost:8888) and the config server at [localhost:8889](http://localhost:8889).

You can configure the ports by changing them in `docker-compose.yml` before starting:

```yml
ports:
  # <host>:<container>
  - 8000:8888
  - 8001:8889
```

## Troubleshooting

* Errors while executing `npm run serve`.
  * The first thing to try is to upgrade to latest version of node.
  * If latest version also produces errors, try installing v4.5.0.
    * An easy fix for that would be [to use `nvm`](http://stackoverflow.com/a/7718438/1585523).
* If you get any node-sass errors, try running `npm rebuild node-sass --force` or the remove `node_modules` folder and run `npm install` again

## Notes

### Creating a Service Worker:
```javascript
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker.register('sw.js', { scope : './' })
    .then( (registration) => { console.log('Service worker registered with: ', registration); });
```

### Initializing a Service Worker:
```javascript
self.addEventListener('fetch', function(event) {
  console.log('HTTP Request captured: ', event.request);
});
```

#### Responding with Service Worker:
```javascript
self.addEventListener('fetch', function(event) {
  event.respondWith(
    new Response( responseString, { headers :{ 'Content-Type' : 'text/html' } })
  );
});
```
- Also, instead of responding with a true Response stream, use the fetch() api which will return a promise that respondWith accepts
- Side note, use fetch() now instead of XMLHttpRequests

#### Install Event
```javascript
self.addEventListener('install', function(event) {

  event.waitUntil(promise)  //hold this event and wait until promises are resolved

})
```
Use this at install of a new version of the service worker.  We can use this to initially cache all the requests we want from the backend


#### Activate Event
```javascript
self.addEventListener('activate', (event) => {

});
```
This event fires when a new version of the service worker is activated

#### Listening to ServiceWorker Changes
```javascript
navigator.serviceWorker.register('/sw.js').then( (reg) => {
  reg.unregister();
  reg.update();
  reg.installing || reg.waiting || reg.active; //will point to a service worker object or be null

  reg.addEventListener('updatefound', () => {
    //reg.installing has changed
    //when this fires .installing has become the new worker
  });

  let sw = reg.installing;
  console.log(sw.state); //.. logs ->
    //'installing' - install event has fired but hasn't completed
    //'installed' - installation completed successfully but hasn't yet activated
    //'activating' - the activate event has fired but not yet complete
    //'activated' - the service worker is ready to receive fetch events
    //'redundant' - service worker has been throw away
        //happens both when sw has been superceded and also when install failed

  sw.addEventListener('statechange', () => {
    //sw.state has changed
  });

  navigator.serviceWorker.controller; //refers to the service worker that controls this page

  if (!navigator.serviceWorker.controller) { 
    //page didn't load using a service worker
  }

  if (reg.waiting) {
    //there's an update ready and waiting 
  }

  if (reg.installing) {
    //there's an update in progress, but it might fail
    reg.installing.addEventListener('statechange', () => {
      if (this.state == 'installed') {
        //there's an update ready and waiting
      }
    });
  }

  reg.addEventListener('updatefound', () => {
    reg.installing.addEventListener('statechange', () => {
      if (this.state == 'installed') {
        //there's an update ready and waiting
      }
    });
  });
});
```

### Caching API
```javascript
//create a cache-box of name to store series of request / responses
caches.open('name-of-cache').then((cache) => {

  //Insert into cache:
  cache.put(request, response); //stores a request / response pair in the cache

  cache.addAll([ 'api/foo', 'api/bar' ]); //stores an array of request / resposne pairs
    //addAll uses fetch under the hood

  //Get from cache:
  cache.match(request); //returns response or NULL
  caches.match(request) // does the same, except searches all caches
})
```

#### Cache Methods
```javascript
caches.open('cache-name') //creates a new cache with the specified name
caches.match(request) //searches all caches for request
caches.delete('cache-name'); //deletes a cache
caches.keys() //gets all keys for all caches
```