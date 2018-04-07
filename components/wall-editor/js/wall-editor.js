(function () {

    let plusIntervalId;
    let minusIntervalId;
    let chagedPhotoId;
    let wall;


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
    }

    function saveChanges() {
        let transaction = db.transaction([STORE_NAME], "readwrite");
        let objectStore = transaction.objectStore(STORE_NAME);
        document.querySelectorAll(".img-wrapper").forEach((imgWrapper) => {
            objectStore.get(Number(imgWrapper.id)).onsuccess = (e) => {
                let photo = e.target.result;
                photo.width = imgWrapper.offsetWidth;
                photo.x1 = imgWrapper.offsetLeft;
                photo.y1 = imgWrapper.offsetTop;
                objectStore.put(photo);
            };
        });
        showNotice("Done!", 500);
    }

    document.addEventListener("mousedown", photoScaleDown);
    document.addEventListener("touchstart", photoScaleDown);
    document.addEventListener("mouseup", photoScaleUp);
    document.addEventListener("touchend", photoScaleUp);


//MOVE
    function mouseMovePhoto(event) {
        wrapper.style.left = wrapper.offsetLeft + event.movementX + "px";
        wrapper.style.top = wrapper.offsetTop + event.movementY + "px";
    }

    function touchMovePhoto(event) {
        wrapper.style.left = event.touches[0].pageX - event.target.width / 2 + "px";
        wrapper.style.top = event.touches[0].pageY - event.target.height + "px";
    }


    document.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("photo")) {
            wall = document.getElementById("wall");
            wrapper = e.target.parentElement;
            chagedPhotoId = wrapper.id;
            wall.addEventListener("mousemove", mouseMovePhoto);
            wall.addEventListener("mouseup", (ev) => {
                wall.removeEventListener("mousemove", mouseMovePhoto);
            });
        }
    });

    document.addEventListener("touchstart", (e) => {
        if (e.target.classList.contains("photo")) {
            wall = document.getElementById("wall");
            wrapper = e.target.parentElement;
            chagedPhotoId = wrapper.id;
            wall.addEventListener("touchmove", touchMovePhoto);
        }
    });
    document.addEventListener("touchend", (e) => {
        if (e.target.id === ("wall")) {
            wall.removeEventListener("touchmove", touchMovePhoto);
        }
    });


//LIVE preview
    let media = navigator.mediaDevices.getUserMedia;
    let photoBackgroundInput;
    let video;
    document.addEventListener("change", (e) => {
        if (e.target.id === "getLocalPhoto") {
            photoBackgroundInput = e.target;
            setBackground();
        }
    });

    function setBackground() {
        if (photoBackgroundInput.files[0]) {
            new Promise(resolve => {
                showPreloader();
                wall = document.getElementById("wall");
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
        ).catch(
            (err) => {
                console.warn(err);
                let result = confirm("Sorry, but your browser doesn't support live preview. Do you want to upload photo from your device?");
                if (result) {
                    photoBackgroundInput.dispatchEvent(new MouseEvent("click"));
                }
                hidePreloader();
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


    document.addEventListener("click", (e) => {
        if (e.target.id === "btnStartPreview") {
            showPreloader();
            startLivePreview();
        } else if (e.target.classList.contains("img-wrapper__btn_remove-temporarily")) {
            e.target.parentElement.parentElement.remove();
        } else if (e.target.classList.contains("img-wrapper__btn_remove-permanently")) {
            let transaction = db.transaction([STORE_NAME], "readwrite");
            let objectStore = transaction.objectStore(STORE_NAME);
            objectStore.delete(Number(e.target.parentElement.parentElement.id));
            e.target.parentElement.parentElement.remove();
        } else if (document.getElementById("videoStream") && e.target.classList.contains("btn_cancel")) {
            video.srcObject.getTracks()[0].stop();
            document.getElementById("videoStream").remove();
        } else if (e.target.classList.contains("btn_pause")) {
            video.pause();
        } else if (e.target.classList.contains("btn_play")) {
            video.play();
        } else if (e.target.id === "saveChanges") {
            saveChanges();
        }
    });
}());