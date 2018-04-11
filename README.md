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

#### Activating waiting serviceWorkers
```javascript
  sw.skipWaiting(); //while it's waiting or installing, this signals that it shouldn't queue behind another worker and should take over straight away

  //sending messages to service workers:
  reg.installing.postMessage({ foo: 'bar'})
    //send msg in service worker:
  sw.addEventListener('message', (event) => { 
    event.data // {foo: 'bar'}
  });

  navigator.serviceWorker.AddEventListener('controllerchange', () => {
    //navigator.serviceWorker.controller has changed, meaning a new service worker has taken over
    //this is a signal that we should reload the page
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

## Index DB
In this course we are using the idb library (https://github.com/jakearchibald/idb) (https://www.npmjs.com/package/idb)
see: public/js/idb-test/index.js or localhost:8888/idb-test/

### Methods
see: https://github.com/jakearchibald/idb

```javascript
idb.open('key', version, callback);  //Creates new db
idb.createObjectStore('name'); //creates a table in db

db.transaction('keyval'); //runs a transaction against an object store (could have multiple object stores)
  //alternate:
  db.transaction('keyval', 'readwrite'); //allows read and write to object store
let keyStore = tx.objectStore('keyval'); //gets data from a specific object store
keyStore.get('hello'); //returns world from the keystore
keyStore.put("value", "key");  //sets a key value pair (yes in opposite order)
tx.complete //property that notes when a transaction completes

//create index: [in db.open upgrade:]
let peopleStore = upgradeDb.transaction.objectStore('people');
peopleStore.createIndex('animal', 'favoriteAnimal');

//read from index:
var animalIndex = peopleStore.index('animal');
return animalIndex.getAll(); //or .getAll('cat') to only query where === cat;

//iterating:
dbPromise.then(function(db) {
  var tx = db.transaction('people');
  var peopleStore = tx.objectStore('people');
  var ageIndex = peopleStore.index('age');
  return ageIndex.openCursor();
}).then(function logPerson(cursor) {
  if (!cursor) return;  //if there are no entries it's undefined
  console.log('Cursorerd at: ' + cursor.value.name);
  //can use: cursor.update(newValue)
  //cursor.delete() to remove self
  //cursor.advance(2) skips the first two items
  return cursor.continue().then(logPerson);
}).then(function() {
  console.log("all persons iterated!");
});
```


## Syntax

### Browser Support
see: 

for each browser:

- Google Chrome - https://www.chromestatus.com/features#ES6
- Microsoft Edge - https://developer.microsoft.com/en-us/microsoft-edge/platform/status/?q=ES6
- Mozilla Firefox - https://platform-status.mozilla.org/

birdseye view of all the feature support for all JavaScript code, check out the ECMAScript Compatibility Table built by @kangax:

- http://kangax.github.io/compat-table/es6/

### Symbols
To create a symbol, you write Symbol() with an optional string as its description.

```javascript
const sym1 = Symbol('apple');
console.log(sym1);
//output: Symbol(apple)
```

#### Symbols are guaranteed unique:

```javascript
const sym2 = Symbol('banana');
const sym3 = Symbol('banana');
console.log(sym2 === sym3);
//output: false
```

#### Symbol usage:

```javascript
const bowl = {
  [Symbol('apple')]: { color: 'red', weight: 136.078 },
  [Symbol('banana')]: { color: 'yellow', weight: 183.15 },
  [Symbol('orange')]: { color: 'orange', weight: 170.097 },
  [Symbol('banana')]: { color: 'yellow', weight: 176.845 }
};
console.log(bowl);
```

### Iterables

The iterator method, which is available via the constant [Symbol.iterator], is a zero arguments function that returns an iterator object. An iterator object is an object that conforms to the iterator protocol.

The iterator protocol is used to define a standard way that an object produces a sequence of values. What that really means is you now have a process for defining how an object will iterate. This is done through implementing the .next() method.

An object becomes an iterator when it implements the .next() method. The .next() method is a zero arguments function that returns an object with two properties:

* value : the data representing the next value in the sequence of values within the object
* done : a boolean representing if the iterator is done going through the sequence of values
If done is true, then the iterator has reached the end of its sequence of values.
If done is false, then the iterator is able to produce another value in its sequence of values.
Here’s the example from earlier, but instead we are using the array’s default iterator to step through the each value in the array.

```javascript
const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const arrayIterator = digits[Symbol.iterator]();  //we are getting the iterator object from the digits array

console.log(arrayIterator.next());
console.log(arrayIterator.next());
console.log(arrayIterator.next());
//output: Object {value: 0, done: false}
//output: Object {value: 1, done: false}
//output: Object {value: 2, done: false}
```

### Proxies
A way to have something act on behalf of another object

The proxy constructor takes two items:
- the object that it will be the proxy for
- an object containing the list of methods it will handle for the proxied object

```javascript
var richard = {status: 'looking for work'};
var agent = new Proxy(richard, {});

agent.status; // returns 'looking for work'
```
The above doesn't actually do anything special with the proxy - it just passes the request directly to the source object! If we want the proxy object to actually intercept the request, that's what the handler object is for!

#### Get Trap
The get trap is used to "intercept" calls to properties:

```javascript
const richard = {status: 'looking for work'};
const handler = {
    get(target, propName) {
        console.log(target); // the `richard` object, not `handler` and not `agent`
        console.log(propName); // the name of the property the proxy (`agent` in this case) is checking
        return target[propName]; //how to access the target object from inside the proxy trap
        //return `He's following many leads, so you should offer a contract as soon as possible!`; //-> to directly return a value instead of using the value in the target object
    },
    set(target, propName, value) {
        if (propName === 'payRate') { // if the pay is being set, take 15% as commission
            value = value * 0.85;
        }
        target[propName] = value;
    }
};
const agent = new Proxy(richard, handler);
agent.status; // logs out the richard object (not the agent object!) and the name of the property being accessed (`status`)
agent.payRate = 1000; // set the actor's pay to $1,000
agent.payRate; // $850 the actor's actual pay
```
In the code above, the handler object has a get method (called a "trap" since it's being used in a Proxy). When the code agent.status; is run on the last line, because the get trap exists, it "intercepts" the call to get the status property and runs the get trap function.

#### Other Traps
So we've looked at the get and set traps (which are probably the ones you'll use most often), but there are actually a total of 13 different traps that can be used in a handler!

- [the get trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/get) - lets the proxy handle calls to property access
- [the set trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/set) - lets the proxy handle setting the property to a new value
- [the apply trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/apply) - lets the proxy handle being invoked (the object being proxied is a function)
- [the has trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/has) - lets the proxy handle the using in operator
- [the deleteProperty trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/deleteProperty) - lets the proxy handle if a property is deleted
- [the ownKeys trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/ownKeys) - lets the proxy handle when all keys are requested
- [the construct trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/construct) - lets the proxy handle when the proxy is used with the new keyword as a constructor
- [the defineProperty trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/defineProperty) - lets the proxy handle when defineProperty is used to create a new property on the object
- [the getOwnPropertyDescriptor trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor) - lets the proxy handle getting the property's descriptors
- [the preventExtenions trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/preventExtenions) - lets the proxy handle calls to Object.preventExtensions() on the proxy object
- [the isExtensible trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/isExtensible) - lets the proxy handle calls to Object.isExtensible on the proxy object
- [the getPrototypeOf trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getPrototypeOf) - lets the proxy handle calls to Object.getPrototypeOf on the proxy object
- [the setPrototypeOf trap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/setPrototypeOf) - lets the proxy handle calls to Object.setPrototypeOf on the proxy object

### Generators
Whenever a function is invoked, the JavaScript engine starts at the top of the function and runs every line of code until it gets to the bottom. There's no way to stop the execution of the function in the middle and pick up again at some later point. This "run-to-completion" is the way it's always been:
```javascript
function getEmployee() {
    console.log('the function has started');

    const names = ['Amanda', 'Diego', 'Farrin', 'James', 'Kagure', 'Kavita', 'Orit', 'Richard'];

    for (const name of names) {
        console.log(name);
    }

    console.log('the function has ended');
}

getEmployee();
```
But what if you want to print out the first 3 employee names then stop for a bit, then, at some later point, you want to continue where you left off and print out more employee names. With a regular function, you can't do this since there's no way to "pause" a function in the middle of its execution.

#### Pausable Functions
If we do want to be able to pause a function mid-execution, then we'll need a new type of function available to us in ES6 - generator functions! Let's look at one:
```javascript
function* getEmployee() {
    console.log('the function has started');

    const names = ['Amanda', 'Diego', 'Farrin', 'James', 'Kagure', 'Kavita', 'Orit', 'Richard'];

    for (const name of names) {
        console.log( name );
    }

    console.log('the function has ended');
}
```
Notice the asterisk (i.e. *) right after the function keyword? That asterisk indicates that this function is actually a generator!

Now check out what happens when we try running this function:

```javascript
getEmployee();

// this is the response I get in Chrome:
getEmployee {[[GeneratorStatus]]: "suspended", [[GeneratorReceiver]]: Window}
```

#### Generators & Iterators
When a generator is invoked, it doesn't actually run any of the code inside the function. Instead, it creates and returns an iterator. This iterator can then be used to execute the actual generator's inner code.

```javascript
const generatorIterator = getEmployee();
generatorIterator.next();

//Produces the code we expect:

//the function has started
Amanda
Diego
Farrin
James
Kagure
Kavita
Orit
Richard
//the function has ended
```
### The Yield Keyword
The yield keyword is new and was introduced with ES6. It can only be used inside generator functions. yield is what causes the generator to pause. Let's add yield to our generator and give it a try:

```javascript
function* getEmployee() {
    console.log('the function has started');

    const names = ['Amanda', 'Diego', 'Farrin', 'James', 'Kagure', 'Kavita', 'Orit', 'Richard'];

    for (const name of names) {
        console.log(name);
        yield;
    }

    console.log('the function has ended');
}
```

Notice that there's now a yield inside the for...of loop. If we invoke the generator (which produces an iterator) and then call .next(), we'll get the following output:
```javascript
const generatorIterator = getEmployee();
generatorIterator.next();
//Logs the following to the console:

//the function has started
Amanda
```

It's paused! But to really be sure, let's check out the next iteration:

```javascript
generatorIterator.next();
//Logs the following to the console:

Diego
```

Now pausing is all well and good, but what if we could send data from the generator back to the "outside" world? We can do this with yield.

#### Yielding Data to the "Outside" World
Instead of logging the names to the console and then pausing, let's have the code "return" the name and then pause.

```javascript
function* getEmployee() {
    console.log('the function has started');

    const names = ['Amanda', 'Diego', 'Farrin', 'James', 'Kagure', 'Kavita', 'Orit', 'Richard'];

    for (const name of names) {
        yield name;
    }

    console.log('the function has ended');
}
```

Notice that now instead of console.log(name); that it's been switched to yield name;. With this change, when the generator is run, it will "yield" the name back out to the function and then pause its execution. Let's see this in action:

```javascript
const generatorIterator = getEmployee();
let result = generatorIterator.next();
result.value // is "Amanda"

generatorIterator.next().value // is "Diego"
generatorIterator.next().value // is "Farrin"
```
#### Sending Data into Generator Function
So we can get data out of a generator by using the yield keyword. We can also send data back into the generator, too. We do this using the .next() method:
```javascript
function* displayResponse() {
    const response = yield;
    console.log(`Your response is "${response}"!`);
}

const iterator = displayResponse();

iterator.next(); // starts running the generator function
iterator.next('Hello Udacity Student'); // send data into the generator
// the line above logs to the console: Your response is "Hello Udacity Student"!
```
Calling .next() with data (i.e. .next('Richard')) will send data into the generator function where it last left off. It will "replace" the yield keyword with the data that you provided.

So the yield keyword is used to pause a generator and used to send data outside of the generator, and then the .next() method is used to pass data into the generator. Here's an example that makes use of both of these to cycle through a list of names one at a time:
```javascript
function* getEmployee() {
    const names = ['Amanda', 'Diego', 'Farrin', 'James', 'Kagure', 'Kavita', 'Orit', 'Richard'];
    const facts = [];

    for (const name of names) {
        // yield *out* each name AND store the returned data into the facts array
        facts.push(yield name); 
    }

    return facts;
}

const generatorIterator = getEmployee();

// get the first name out of the generator
let name = generatorIterator.next().value;

// pass data in *and* get the next name
name = generatorIterator.next(`${name} is cool!`).value; 

// pass data in *and* get the next name
name = generatorIterator.next(`${name} is awesome!`).value; 

// pass data in *and* get the next name
name = generatorIterator.next(`${name} is stupendous!`).value; 

// you get the idea
name = generatorIterator.next(`${name} is rad!`).value; 
name = generatorIterator.next(`${name} is impressive!`).value;
name = generatorIterator.next(`${name} is stunning!`).value;
name = generatorIterator.next(`${name} is awe-inspiring!`).value;

// pass the last data in, generator ends and returns the array
const positions = generatorIterator.next(`${name} is magnificent!`).value; 

// displays each name with description on its own line
positions.join('\n');
```

## Developer Fu

### Polyfills
see: [https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills](https://github.com/Modernizr/Modernizr/wiki/HTML5-Cross-Browser-Polyfills)

### Transpiling
- Use babel
- For online transpiler see: [http://babeljs.io/repl/#?babili=false&evaluate=true&lineWrap=false&presets=es2015](http://babeljs.io/repl/#?babili=false&evaluate=true&lineWrap=false&presets=es2015)

#### Use
The way Babel transforms code from one language to another is through plugins. There are plugins that transform ES6 arrow functions to regular ES5 functions (the ES2015 arrow function plugin). There are plugins that transform ES6 template literals to regular string concatenation (the ES2015 template literals transform). For a full list, check out all of Babel's plugins.

Now, you're busy and you don't want to have to sift through a big long list of plugins to see which ones you need to convert your code from ES6 to ES5. So instead of having to use a bunch of individual plugins, Babel has presets which are groups of plugins bundled together. So instead of worrying about which plugins you need to install, we'll just use the ES2015 preset that is a collection of all the plugins we'll need to convert all of our ES6 code to ES5.

You can see that the project has a .babelrc file. This is where you'd put all of the plugins and/or presets that the project will use. Since we want to convert all ES6 code, we've set it up so that it has the ES2015 preset.

#### How it all ties together:

- package.json/devDependencies: need to install babel && babel-cli packages
- .babelrc: which presets to use for babel transformation
- package.json/scripts/build: may be used for instructions for babel when it runs (like gulp)