const APP_NAME = "PhotoWalls";
const LIMIT_VAR = 25;
const POSITION_START_BORDERS = 50;
const DB_NAME = "photoWall";
const DB_VERSION = 1;
const STORE_NAME = "myGallary";
const START_PAGE_URL = "templates/photo-editor.html";

let db;

// openDB(DB_NAME, DB_VERSION, STORE_NAME);
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
function showPreloader(wrapper) {
    wrapper = wrapper || document.body;
    let preloader = document.createElement("img");
    preloader.id = "preloader";
    preloader.src = "img/ui/preloader.svg";
    wrapper.appendChild(preloader);
}
function hidePreloader() {
    document.getElementById("preloader").remove();
}

function getData(url) {
    return new Promise(resolve => {
        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.send();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) {
                return;
            }
            if (xhr.status !== 200) {
                alert(xhr.status + ': ' + xhr.statusText); // пример вывода: 404: Not Found
            } else {
                resolve(xhr.responseText);
            }
        };
    }).then(data => {
            return data;
        }
    );
}
function changeContent(url, wrapper) {
    getData(url).then(content => {
        wrapper.innerHTML = content;
    });
}

document.addEventListener("DOMContentLoaded", () => {
    getData(START_PAGE_URL).then(content => {
        document.getElementById("main").innerHTML = content;
    });
});
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav__item")) {
        e.preventDefault();
        closeMobileMenu();
        changeContent(e.target.href, document.getElementById("main"));
        document.querySelectorAll(".nav__item").forEach((el) => {
            el.classList.remove("nav__item_active");
        });
        e.target.classList.add("nav__item_active");
    }

});
