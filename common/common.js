const APP_NAME = "PhotoWalls";
const LIMIT_VAR = 25;
const POSITION_START_BORDERS = 50;
const DB_NAME = "photoWall";
const DB_VERSION = 1;
const STORE_NAME = "myGallary";

let db;

function openDB(dbName, dbVersion, objectStoreName) {
    return new Promise(resolve => {
        let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        if (!window.indexedDB) {
            window.alert("Sorry, but your browser doesn't support saving images. You can update it and repeat again, or save this image on your PC.");
        }
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
            resolve(db);
        };
        request.onerror = function (event) {
            alert("Error: " + event.target.errorCode);
        };
    });
}




function showPreloader() {
    let preloader = document.createElement("img");
    preloader.id = "preloader";
    preloader.src = "img/ui/preloader.svg";
    document.querySelector(".canvas-wrapper").appendChild(preloader);
}

function hidePreloader() {
    document.getElementById("preloader").remove();
}