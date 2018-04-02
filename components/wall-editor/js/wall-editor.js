(function () {

    let plusIntervalId;
    let minusIntervalId;
    let chagedPhotoId;

// Запрос всех файлов из галереи
    openDB(DB_NAME, DB_VERSION, STORE_NAME).then(db => {
        let wall = document.querySelector(".wall");
        let transaction = db.transaction([STORE_NAME], "readonly");
        let objectStore = transaction.objectStore(STORE_NAME);
        let request = objectStore.getAll();

        request.onsuccess = () => {
            let myGallary = request.result;

            myGallary.forEach((el) => {
                let wrapper = document.createElement("div");
                let btnPlus = document.createElement("div");
                let btnMinus = document.createElement("div");
                btnPlus.classList.add("img-wrapper__btn");
                btnPlus.classList.add("img-wrapper__btn_plus");
                btnMinus.classList.add("img-wrapper__btn");
                btnMinus.classList.add("img-wrapper__btn_minus");
                btnPlus.innerHTML = "+";
                btnMinus.innerHTML = "-";
                wrapper.appendChild(btnPlus);
                wrapper.appendChild(btnMinus);
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
            img = e.target.parentElement.getElementsByTagName("img")[0];
            chagedPhotoId = e.target.parentElement.id;
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


    ////////////////////MOVE


    function movePhoto(wrapper, event) {
        wrapper.style.left = wrapper.offsetLeft + event.movementX + "px";
        wrapper.style.top = wrapper.offsetTop + event.movementY + "px";
    }

    document.addEventListener("mouseup", (e) => {
        console.log("поднято");
    });
    document.addEventListener("mousedown", (e) => {
        console.log("нажато");
        if (e.target.classList.contains("photo")) {
            let wrapper = e.target.parentElement;
            chagedPhotoId = wrapper.id;
            document.addEventListener("mousemove", (event) => {
                movePhoto(wrapper, event);
            });
        }
    });


}());