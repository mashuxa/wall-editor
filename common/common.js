const APP_NAME = "PhotoWalls";
const LIMIT_VAR = 25;
const POSITION_START_BORDERS = 50;
const DB_NAME = "photoWall";
const DB_VERSION = 1;
const STORE_NAME = "myGallary";

let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
let db;


// проверка поддержки indexedDB
if (!window.indexedDB) {
    window.alert("Sorry, but your browser doesn't support saving images. You can update it and repeat again, or save this image on your PC.");
}
function openDB(dbName, dbVersion, objectStoreName) {

    let request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = function (event) {
        db = event.target.result;
        if (!db.objectStoreNames.contains(objectStoreName)) {
            db.createObjectStore(STORE_NAME, {
                keyPath: "id"
            });
        }
    };
    request.onsuccess = function (event) {
        db = event.target.result;
    };
    request.onerror = function (event) {
        alert("Error: " + event.target.errorCode);
    };
}
openDB(DB_NAME, DB_VERSION, STORE_NAME);
