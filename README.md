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