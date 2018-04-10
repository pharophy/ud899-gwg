import idb from 'idb';

var dbPromise = idb.open('test-db', 7, function(upgradeDb) {
  let peopleStore;
  switch(upgradeDb.oldVersion) {    
    case 0:
      var keyValStore = upgradeDb.createObjectStore('keyval');
      keyValStore.put("world", "hello");
      //specifically does not have BREAK; statement to continue across versions
    case 1:
      upgradeDb.createObjectStore('people', { keyPath: 'name' });
      //specifically does not have BREAK; statement to continue across versions
    case 2:
      upgradeDb.deleteObjectStore('people');
      upgradeDb.createObjectStore('people', { keyPath: 'name' });
      //specifically does not have BREAK; statement to continue across versions
    case 3:
      peopleStore = upgradeDb.transaction.objectStore('people');
      peopleStore.createIndex('animal', 'favoriteAnimal');
    case 6:
      peopleStore = upgradeDb.transaction.objectStore('people');
      peopleStore.createIndex('age', 'age');
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
  let tx = db.transaction('keyval', 'readwrite');
  let keyValStore = tx.objectStore('keyval');
  keyValStore.put('dog', 'favoriteAnimal');
  return tx.complete;  //REMEMBER TO CLOSE / GET RESULT OF TRANSACTION!
}).then(function(val) {
  console.log("Completed successfully with: ", val);
});

dbPromise.then(function(db) {
  var tx = db.transaction('people', 'readwrite');
  var peopleStore = tx.objectStore('people');

  peopleStore.put({
    name : 'Sam Munoz',
    age: 25,
    favoriteAnimal: 'dog'
  });

  peopleStore.put({
    name : 'Joe Rogan',
    age: 32,
    favoriteAnimal: 'lizard'
  });

  peopleStore.put({
    name : 'Josh Yolanda',
    age: 58,
    favoriteAnimal: 'rat'
  });

  peopleStore.put({
    name : 'Peter Piper',
    age: 18,
    favoriteAnimal: 'cat'
  });

  peopleStore.put({
    name : 'Carlie Calla',
    age: 33,
    favoriteAnimal: 'dog'
  });
  return tx.complete;
}).then(function(val) {
  console.log("added person: ", val);
});

//read people
dbPromise.then(function(db) {
  var tx = db.transaction('people');
  var peopleStore = tx.objectStore('people');
  //return peopleStore.getAll();
  var animalIndex = peopleStore.index('animal');
  return animalIndex.getAll('cat');
}).then(function(people) {
  console.log('cat people: ', people);
});

//read people by age:
dbPromise.then(function(db) {
  var tx = db.transaction('people');
  var peopleStore = tx.objectStore('people');
  var ageIndex = peopleStore.index('age');
  return ageIndex.getAll();
}).then(function(people) {
  console.log('people by age: ', people);
});