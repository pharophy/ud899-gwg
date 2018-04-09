import idb from 'idb';

var dbPromise = idb.open('test-db', 2, function(upgradeDb) {

  switch(upgradeDb.oldVersion) {
    case 0:
      var keyValStore = upgradeDb.createObjectStore('keyval');
      keyValStore.put("world", "hello");
      //specifically does not have BREAK; statement to continue across versions
    case 1:
      upgradeDb.createObjectStore('people', { ketPath: 'name' });
      //specifically does not have BREAK; statement to continue across versions
  }
  
});

// read "hello" in "keyval"
dbPromise.then(function(db) {
  var tx = db.transaction('keyval');
  var keyValStore = tx.objectStore('keyval');
  return keyValStore.get('hello');
}).then(function(val) {
  console.log('The value of "hello" is:', val);
});

// set "foo" to be "bar" in "keyval"
dbPromise.then(function(db) {
  var tx = db.transaction('keyval', 'readwrite');
  var keyValStore = tx.objectStore('keyval');
  keyValStore.put('bar', 'foo');
  return tx.complete;
}).then(function() {
  console.log('Added foo:bar to keyval');
});

dbPromise.then(function(db) {
  // TODO: in the keyval store, set
  // "favoriteAnimal" to your favourite animal
  // eg "cat" or "dog"
  let tx = db.transaction('keyval', 'readwrite');
  let keyValStore = tx.objectStore('keyval');
  keyValStore.put('dog', 'favoriteAnimal');
  return tx.complete;  //REMEMBER TO CLOSE / GET RESULT OF TRANSACTION!
}).then(function(val) {
  console.log("Completed successfully with: ", val);
});