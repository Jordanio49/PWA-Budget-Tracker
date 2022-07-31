// variable to hold the connection to the db
let db;

// create new request for 'budget' database
const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(e) {
    
    // saving a database reference
    const db = e.target.result;

    // create an object store called pending and set it to auto increment
    db.CreateObjectStore('pending', { autoIncrement: true });
};

request.onsuccess = function(e) {
    db = e.target.result;

    // check if app is online before reading from the database
    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(e) {
    console.log('error: ' + e.target.errorCode);
};

function saveRecord(record) {
    // create a transaction on db with read/write access
    const transaction = db.transaction(['pending'], 'readwrite');

    // accessing 'pending' object store
    const store = transaction.objectStore('pending')

    // adding record to the store using the add method
    store.add(record);
}

function checkDatabase() {
    // opening a transaction on the 'pending' db
    const transaction = db.transaction(["pending"], "readwrite");
    
    // accessing the 'pending' object store
    const store = transaction.objectStore("pending");
    
    // setting all records from the store to a variable
    const getAll = store.getAll();
  
    getAll.onsuccess = function() {
      if (getAll.result.length > 0) {
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then(() => {
          // if successful, open a transaction on 'pending' db
          const transaction = db.transaction(["pending"], "readwrite");
  
          // accessing 'pending' object store
          const store = transaction.objectStore("pending");
  
          // clear all items in store
          store.clear();
        });
      }
    };
  }
  
  // listen for app coming back online
  window.addEventListener("online", checkDatabase)