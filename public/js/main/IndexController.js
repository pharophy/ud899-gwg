import PostsView from './views/Posts';
import ToastsView from './views/Toasts';
import idb from 'idb';

function openDatabase() {
  //if the browser doesn't support sw's then we don't care about having a db:
  if (!navigator.serviceWorker) {
    return Promise.resolve();
  }
  //return a promise for a db called 'wittr' with objectStore 'witters'
  //id = key, index by-date sorted by time property
  var dbPromise = idb.open('wittr', 2, function(upgradeDb) {
    let peopleStore;
    switch(upgradeDb.oldVersion) {    
      case 0:
        upgradeDb.createObjectStore('wittrs', { keyPath: 'id' });
      case 1:
        let wittrStore = upgradeDb.transaction.objectStore('wittrs');
        wittrStore.createIndex('by-date', 'time');
    } 
  });

  return dbPromise;
}

export default function IndexController(container) {
  this._container = container;
  this._postsView = new PostsView(this._container);
  this._toastsView = new ToastsView(this._container);
  this._lostConnectionToast = null;
  this._openSocket();
  this._dbPromise = openDatabase();
  this._registerServiceWorker();
}

IndexController.prototype._registerServiceWorker = function() {
  if (!navigator.serviceWorker) return;
    
  const swPromise = navigator.serviceWorker.register('sw.js', { scope : './' });
  swPromise.then( (registration) => { console.log('Service worker registered with: ', registration); });
  //check for updates to SW
  let indexController = this;
  swPromise.then((reg) => this._checkForSWUpdates(reg, indexController) );

};

IndexController.prototype._checkForSWUpdates = function(registration, indexController) {
  //there's no controller, this page wasn't loaded via SW
  if (!navigator.serviceWorker.controller) { 
    return;
  }
  
  //updated worker already waiting
  if (registration.waiting) {
    indexController._updateReady(registration.waiting);
    return;
  }

  //updated worker installing, waiting until installed:
  if (registration.installing) {
    //there's an update in progress, but it might fail
    indexController._trackInstalling(registration.installing, indexController);
    return;
  }

  //listen for new installing workers, if one arrives, track it's progress
  registration.addEventListener('updatefound', () => {
    if (registration.installing) {
      indexController._trackInstalling(registration.installing, indexController);
    }
  });

  //listen for the controlling service worker changing and reload the page
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    //navigator.serviceWorker.controller has changed, meaning a new service worker has taken over
    window.location.reload();
  });
};

IndexController.prototype._trackInstalling = function(worker, indexController) {
  worker.addEventListener('statechange', () => {
    if (worker.state == 'installed') {
      //there's an update ready and waiting
      indexController._updateReady(worker);
    }
  });
};

IndexController.prototype._updateReady = function(worker) {
  var toast = this._toastsView.show("New version available", {
    buttons: ['refresh', 'dismiss']
  });

  toast.answer.then((answer) => {
    if (answer != 'refresh') return;
    //tell service worker to skip waiting
    worker.postMessage({reload : true});
  })
};

// open a connection to the server for live updates
IndexController.prototype._openSocket = function() {
  var indexController = this;
  var latestPostDate = this._postsView.getLatestPostDate();

  // create a url pointing to /updates with the ws protocol
  var socketUrl = new URL('/updates', window.location);
  socketUrl.protocol = 'ws';

  if (latestPostDate) {
    socketUrl.search = 'since=' + latestPostDate.valueOf();
  }

  // this is a little hack for the settings page's tests,
  // it isn't needed for Wittr
  socketUrl.search += '&' + location.search.slice(1);

  var ws = new WebSocket(socketUrl.href);

  // add listeners
  ws.addEventListener('open', function() {
    if (indexController._lostConnectionToast) {
      indexController._lostConnectionToast.hide();
    }
  });

  ws.addEventListener('message', function(event) {
    requestAnimationFrame(function() {
      indexController._onSocketMessage(event.data);
    });
  });

  ws.addEventListener('close', function() {
    // tell the user
    if (!indexController._lostConnectionToast) {
      indexController._lostConnectionToast = indexController._toastsView.show("Unable to connect. Retrying…");
    }

    // try and reconnect in 5 seconds
    setTimeout(function() {
      indexController._openSocket();
    }, 5000);
  });
};

// called when the web socket sends message data
IndexController.prototype._onSocketMessage = function(data) {
  var messages = JSON.parse(data);
  
  this._dbPromise.then(function(db) {
    if (!db) return;
    let tx = db.transaction('wittrs', 'readwrite');
    let wittrStore = tx.objectStore('wittrs');
    for (const message of messages) {
      wittrStore.put(message);
    }
    
    ////let timeIndex = wittrStore.index('by-date');
    ////return timeIndex.getAll();
  });

  this._postsView.addPosts(messages);
};