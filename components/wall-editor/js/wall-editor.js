(function () {

    let plusIntervalId;
    let minusIntervalId;
    let chagedPhotoId;
    let wall = document.querySelector(".wall");
    let wrapper;
// Запрос всех файлов из галереи
    openDB(DB_NAME, DB_VERSION, STORE_NAME).then(db => {

        let transaction = db.transaction([STORE_NAME], "readonly");
        let objectStore = transaction.objectStore(STORE_NAME);
        let request = objectStore.getAll();

        request.onsuccess = () => {
            let myGallary = request.result;
            myGallary.forEach((el) => {
                let wrapper = document.createElement("div");
                let btnPlus = document.createElement("div");
                let btnMinus = document.createElement("div");
                let removeOnlyNow = document.createElement("div");
                removeOnlyNow.classList.add("img-wrapper__btn_remove-only-now");
                btnPlus.classList.add("img-wrapper__btn");
                btnPlus.classList.add("img-wrapper__btn_plus");
                btnMinus.classList.add("img-wrapper__btn");
                btnMinus.classList.add("img-wrapper__btn_minus");
                btnPlus.innerHTML = "+";
                btnMinus.innerHTML = "-";
                removeOnlyNow.innerHTML = "Remove";
                wrapper.appendChild(btnPlus);
                wrapper.appendChild(btnMinus);
                wrapper.appendChild(removeOnlyNow);
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

// отмена стандартного действия
wall.ondragstart = function() {
    return false;
};
wall.onselectstart = function() {
    return false;
};

function mouseMovePhoto(event){
        wrapper.style.left = wrapper.offsetLeft + event.movementX + "px";
        wrapper.style.top = wrapper.offsetTop + event.movementY + "px";
}
wall.addEventListener("mousedown", (e) => {
    console.log(e.target);
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



function touchMovePhoto(event){
    wrapper.style.left = event.touches[0].pageX - event.target.width/2 + "px";
    wrapper.style.top =  event.touches[0].pageY - event.target.height + "px";
}
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



document.body.addEventListener("click", (e)=>{
    if(e.target.classList.contains("img-wrapper__btn_remove-only-now")){
        e.target.parentElement.remove();
    }
});



document.getElementById("btnStartPreview").addEventListener("click", (e)=>{


    // проверить поддержку потока, если работает то
    // запустить видеопоток
    // если нет, то предложить загрузить фото после конфирма


});










}());