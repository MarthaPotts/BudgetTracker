//cross-browsers
window.indexedDB = 
window.indexedDB || 
window.mozIndexedDB ||
window.webkitIndexedDB ||
window.msIndexedDB; 

window.IDBTransaction = 
window.IDBTransaction ||
window.webkitIDBTransaction ||
window.msIDBTransaction ||
{READ_WRITE: 'readwrite'}; 

if (!window.indexedDB) {
    console.log(`Your browser doesn't support IndexedDB. 
    Certain features may not be available`); 
}
//open database and handle errors in general
let db; 
const request = window.indexedDB.open('budget', 1);
request.onerror = function(event) {
    console.log('Won\'t work without IndexedDB'); 
}; 
request.onsuccess = function(event) {
    db = event.target.result; 
    if (navigator.onLine) {
        checkDatabase(); 
    }
};
db.onerror = function(event) {
    console.error('database error' + event.target.errorCode);
};
//in the handler for upgradeneeded event, create objectStores needed for version of db
request.onupgradeneeded = function(event) {
    let db = event.target.result; 
    //'name', keyGen
    db.createObjectStore('pending', {autoIncrement: true}); 
}; 
//specify span and mode of transaction, giving write access and adding to objectStore

function addToStore(record) {
    let transaction = db.transaction( ['pending'], 'readwrite'); 
    let store = transaction.objectStore('pending'); 
    store.add(record); 
}
//look for pending (if any) and gather into an array to update 
function checkDatabase() {
    let transaction = db.transaction(['pending'], 'readwrite'); 
    let store = transaction.objectStore( 'pending'); 
    let getAll = store.getAll(); 
    
    getAll.onsuccess = function(event) {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result), 
                headers: {
                    Accept: "application/json, text/plain, */*", 
                    "Content-Type": "application/json"
                }
            }).then( () => {
                let transaction = db.transaction(['pending'], 'readwrite'); 
                let store = transaction.objectStore('pending'); 
                store.clear(); 
            }); 
        }
    };
}
//if back online, update from cache/indexedDB
window.addEventListener('online', checkDatabase); 