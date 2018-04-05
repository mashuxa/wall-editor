(function () {

    let plusIntervalId;
    let minusIntervalId;
    let chagedPhotoId;
    let wall = document.querySelector(".wall");
    let wrapper;

    function createContextMenuBtns(wrapper){
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
// Запрос всех файлов из галереи
    openDB(DB_NAME, DB_VERSION, STORE_NAME).then(db => {
        let transaction = db.transaction([STORE_NAME], "readonly");
        let objectStore = transaction.objectStore(STORE_NAME);
        let request = objectStore.getAll();

        request.onsuccess = () => {
            let myGallary = request.result;
            myGallary.forEach((el) => {
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
    });


// SCALE
    function photoScaleDown(e) {
        let img;
        if (e.target.classList.contains("img-wrapper__btn_plus") || e.target.classList.contains("img-wrapper__btn_minus")) {
            img = e.target.parentElement.parentElement.getElementsByTagName("img")[0];
            chagedPhotoId = e.target.parentElement.parentElement.id;
        }
        if (e.target.classList.contains("img-wrapper__btn_plus")) {
            plusIntervalId = setInterval(function () {
                img.width = img.width + 5;
            }, 30);
        } else if (e.target.classList.contains("img-wrapper__btn_minus")) {
            plusIntervalId = setInterval(function () {
                img.width = img.width - 5;
            }, 30);
        }
    }
    function photoScaleUp(e) {
        clearInterval(plusIntervalId);
        clearInterval(minusIntervalId);
        if (chagedPhotoId) {
            let transaction = db.transaction([STORE_NAME], "readwrite");
            let objectStore = transaction.objectStore(STORE_NAME);
            let currentPhoto;
            objectStore.get(Number(chagedPhotoId)).onsuccess = (e) => {
                currentPhoto = e.target.result;
                currentPhoto.width = document.getElementById(chagedPhotoId).offsetWidth;
                objectStore.put(currentPhoto);
            };
        }
    }
    document.body.addEventListener("mousedown", photoScaleDown);
    document.body.addEventListener("touchstart", photoScaleDown);
    document.addEventListener("mouseup", photoScaleUp);
    document.addEventListener("touchend", photoScaleUp);


//MOVE
// отмена стандартного действия
    wall.ondragstart = () => {
        return false;
    };
    wall.onselectstart = ()=> {
        return false;
    };
    function mouseMovePhoto(event) {
        wrapper.style.left = wrapper.offsetLeft + event.movementX + "px";
        wrapper.style.top = wrapper.offsetTop + event.movementY + "px";
    }
    function touchMovePhoto(event) {
        wrapper.style.left = event.touches[0].pageX - event.target.width / 2 + "px";
        wrapper.style.top = event.touches[0].pageY - event.target.height + "px";
    }
    wall.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("photo")) {
            wrapper = e.target.parentElement;
            chagedPhotoId = wrapper.id;
            wall.addEventListener("mousemove", mouseMovePhoto);
            wall.addEventListener("mouseup", (ev) => {
                wall.removeEventListener("mousemove", mouseMovePhoto);
                let transaction = db.transaction([STORE_NAME], "readwrite");
                let objectStore = transaction.objectStore(STORE_NAME);
                let currentPhoto;
                objectStore.get(Number(chagedPhotoId)).onsuccess = (e) => {
                    currentPhoto = e.target.result;
                    currentPhoto.x1 = wrapper.offsetLeft;
                    currentPhoto.y1 = wrapper.offsetTop;
                    objectStore.put(currentPhoto);
                };
            });
        }
    });
    wall.addEventListener("touchstart", (e) => {
        if (e.target.classList.contains("photo")) {
            wrapper = e.target.parentElement;
            chagedPhotoId = wrapper.id;
            wall.addEventListener("touchmove", touchMovePhoto);
        }
    });
    wall.addEventListener("touchend", () => {

        wall.removeEventListener("touchmove", touchMovePhoto);
        let transaction = db.transaction([STORE_NAME], "readwrite");
        let objectStore = transaction.objectStore(STORE_NAME);
        let currentPhoto;
        objectStore.get(Number(chagedPhotoId)).onsuccess = (e) => {
            currentPhoto = e.target.result;
            currentPhoto.x1 = wrapper.offsetLeft;
            currentPhoto.y1 = wrapper.offsetTop;
            objectStore.put(currentPhoto);
        };

    });



//LIVE preview
    let media = navigator.mediaDevices.getUserMedia;
    let photoBackgroundInput = document.getElementById("getLocalPhoto");
    let video;
    photoBackgroundInput.addEventListener("change", setBackground);
    function setBackground() {
        if (photoBackgroundInput.files[0]) {
            new Promise(resolve => {
                showPreloader();
                let img = new Image();
                img.onload = () => resolve(img);
                img.src = URL.createObjectURL(photoBackgroundInput.files[0]);
            }, reject => {
                alert("Error!");
            }).then(img => {
                wall.style.backgroundImage = "url(" + img.src + ")";
                wall.style.backgroundPosition = "center";
                wall.style.backgroundSize = "contain";
                wall.style.backgroundRepeat = "no-repeat";
                hidePreloader();
            });
        }
    }
    function createVideoBtns(wrapper) {
        let btnCancel, btnPause, btnPlay;
        btnCancel = document.createElement("div");
        btnPause = document.createElement("div");
        btnPlay = document.createElement("div");
        btnCancel.classList.add("btn");
        btnCancel.classList.add("btn_cancel");
        btnPause.classList.add("btn");
        btnPause.classList.add("btn_pause");
        btnPlay.classList.add("btn");
        btnPlay.classList.add("btn_play");
        btnCancel.innerHTML = "Cancel";
        btnPause.innerHTML = "Pause";
        btnPlay.innerHTML = "Play";
        wrapper.appendChild(btnCancel);
        wrapper.appendChild(btnPause);
        wrapper.appendChild(btnPlay);
    }
    function startLivePreview() {
        navigator.mediaDevices.getUserMedia({audio: false, video: true}).then(
            (stream) => {
                video = document.createElement("video");
                video.classList.add("video-stream");
                video.id = "videoStream";
                video.setAttribute("autoplay", true);
                video.srcObject = stream;
                video.onloadedmetadata = (e) => {
                    video.play();
                    wall.appendChild(video);
                    createVideoBtns(wall);
                    hidePreloader();
                };
            }
        ).catch((err) => {
            alert(err);
        });
    }

// For older browsers
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }
    document.getElementById("btnStartPreview").addEventListener("click", (e) => {
        if (media) {
            startLivePreview();
            showPreloader();
        } else {
            let result = confirm("Sorry, but your browser doesn't support live preview. Do you want to upload photo from your device?");
            if (result) {
                photoBackgroundInput.dispatchEvent(new MouseEvent("click"));
            }
        }
    });
    document.body.addEventListener("click", (e) => {
        if (e.target.classList.contains("img-wrapper__btn_remove-temporarily")) {
            e.target.parentElement.parentElement.remove();
        } else if (e.target.classList.contains("img-wrapper__btn_remove-permanently")) {
            let transaction = db.transaction([STORE_NAME], "readwrite");
            let objectStore = transaction.objectStore(STORE_NAME);
            objectStore.delete(Number(e.target.parentElement.parentElement.id));
            e.target.parentElement.parentElement.remove();
        } else if (e.target.classList.contains("btn_cancel")) {
            video.srcObject.getTracks()[0].stop();
            document.getElementById("videoStream").remove();
        } else if (e.target.classList.contains("btn_pause")) {
            video.pause();
        } else if (e.target.classList.contains("btn_play")) {
            video.play();
        }
    });
}());