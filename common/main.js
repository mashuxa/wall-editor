const APP_NAME = "PhotoWalls";
const LIMIT_VAR = 25;
const POSITION_START_BORDERS = 50;
const DB_NAME = "photoWall";
const DB_VERSION = 1;
const STORE_NAME = "myGallary";
const START_PAGE_URL = "templates/photo-editor.html";


let user = {
    name: null,
    email: null,
    gallary: null
};


class Notice {
    constructor(innerTxt, hideTime) {
        this.innerTxt = innerTxt;
        this.id = Date.now();
        this.node = document.createElement("div");
        this.node.classList.add("notice");
        this.node.id = this.id;
        this.node.innerHTML = this.innerTxt;
    }

    show(delay) {
        let id = this.id;
        document.body.appendChild(this.node);
        setTimeout(function () {
            document.getElementById(id).style.opacity = 0;
            document.getElementById(id).style.transform = "translateY(-100px)";
        }, delay);
        setTimeout(function () {
            document.getElementById(id).remove();
        }, delay + 500);
    }
}

class Report {
    constructor(userName, userEmail, reportContent) {
        this.userName = userName;
        this.userEmail = userEmail;
        this.reportContent = reportContent;
    }
}

function showNotice(innerTxt, delay) {
    let notice = new Notice(innerTxt);
    notice.show(delay);
}


// отмена стандартного действия
document.ondragstart = function () {
    return false;
};
document.onselectstart = function () {
    return false;
};

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
    });
}

function changeContent(url, wrapper, callback) {
    getData(url).then(content => {
        wrapper.innerHTML = content;
    }).then(() => {
        if (callback) {
            callback();
        }
    });
}


function createContextMenuBtns(wrapper) {
    let btnPlus = document.createElement("div");
    let btnMinus = document.createElement("div");
    let btnRemoveTemporarily = document.createElement("div");
    let btnRemovePermanently = document.createElement("div");
    let contextMenu = document.createElement("div");
    contextMenu.classList.add("context-menu");
    btnPlus.classList.add("img-wrapper__btn");
    btnPlus.classList.add("img-wrapper__btn_plus");
    btnMinus.classList.add("img-wrapper__btn");
    btnMinus.classList.add("img-wrapper__btn_minus");
    btnRemoveTemporarily.classList.add("img-wrapper__btn");
    btnRemoveTemporarily.classList.add("img-wrapper__btn_remove-temporarily");
    btnRemovePermanently.classList.add("img-wrapper__btn");
    btnRemovePermanently.classList.add("img-wrapper__btn_remove-permanently");
    btnPlus.innerHTML = "Scale Up +";
    btnMinus.innerHTML = "Scale Down -";
    btnRemoveTemporarily.innerHTML = "Remove temporarily ×";
    btnRemovePermanently.innerHTML = "Remove permanently ×";
    contextMenu.appendChild(btnPlus);
    contextMenu.appendChild(btnMinus);
    contextMenu.appendChild(btnRemoveTemporarily);
    contextMenu.appendChild(btnRemovePermanently);
    wrapper.appendChild(contextMenu);
}

function getGallaryImages(db) {
    let transaction = db.transaction([STORE_NAME], "readonly");
    let objectStore = transaction.objectStore(STORE_NAME);
    let request = objectStore.getAll();
    request.onsuccess = () => {
        user.gallary = request.result;
        user.gallary.forEach((el) => {
            let wrapper = document.createElement("div");
            createContextMenuBtns(wrapper);
            wrapper.style.left = el.x1 + "px";
            wrapper.style.top = el.y1 + "px";
            new Promise(resolve => {
                wrapper.id = el.id;
                wrapper.classList.add("img-wrapper");
                let img = new Image();
                img.classList.add("photo");
                img.width = el.width;
                img.src = URL.createObjectURL(el.blob);
                img.onload = () => resolve(img);
            }).then(img => {
                wrapper.appendChild(img);
                wall.appendChild(wrapper);
            });
        });
    };
}

//Загрузка первой страницы
document.addEventListener("DOMContentLoaded", () => {
    getData(START_PAGE_URL).then(content => {
        document.getElementById("main").innerHTML = content;
    });
});

//Навигация
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("nav__item")) {
        e.preventDefault();
        closeMobileMenu();
        document.querySelectorAll(".nav__item").forEach((el) => {
            el.classList.remove("nav__item_active");
        });
        e.target.classList.add("nav__item_active");
        changeContent(e.target.href, document.getElementById("main"), function () {
            if (e.target.id === "wallEditor") {
                openDB(DB_NAME, DB_VERSION, STORE_NAME).then(db => {
                    getGallaryImages(db);
                });

            }
        });
    }
});


//report
document.addEventListener("click", (e) => {
    if (e.target.id === "sendReport") {
        let userName = document.forms.bugReport.userName.value;
        let userEmail = document.forms.bugReport.userEmail.value;
        let reportContent = document.forms.bugReport.reportContent.value;

        let report = new Report(userName, userEmail, reportContent);

        console.log(report);

    }
});





