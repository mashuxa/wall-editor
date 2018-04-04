(function () {
    "use strict";
    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    let fileInput = document.getElementById("fileInput");
    let canvasImg, canvasImgWidth, canvasImgHeight;
    let cursorPositionX, cursorPositionY;
    let animationId;
    let scaleK;
    let x1, x2, y1, y2;
    let imgSettings = {
        filterBrightness: 1,
        filterContrast: 1,
        filterHueRotate: 0,
        filterSaturate: 1,
        filterGrayscale: 0,
        filterSepia: 0,
        filterInvert: 0,
        filterBlur: 0,
        filterOpacity: 1,
        x1: POSITION_START_BORDERS,
        y1: POSITION_START_BORDERS
    };
    let plusIntervalId, minusIntervalId;
    let imgBlobBuffer;
    let imgDataUrl;

    //<<<<<<< MAIN >>>>>>>//
    class Photo {
        constructor(img) {
            this.id = Date.now();
            this.blob = imgBlobBuffer;
            this.x1 = 0;
            this.y1 = 0;
            this.width = img.width;
        }
    }
    openDB(DB_NAME, DB_VERSION, STORE_NAME);
    //загрузить картинку
    function loadImg() {
        let isContinueChange = true;
        if (canvasImg) {
            isContinueChange = confirm("The current image will be overwritten. Are you sure you want to continue?");
        }
        if (isContinueChange && fileInput.files[0]) {
            showPreloader(document.querySelector(".canvas-wrapper"));
            // вызываем функццию для получения img и передаем blob объект полученный из fileInput.
            blobToImg(fileInput.files[0]).then(img => {
                canvasImg = img;
                canvasImgWidth = canvasImg.width;
                canvasImgHeight = canvasImg.height;
                canvas.width = canvasImgWidth;
                canvas.height = canvasImgHeight;
                imgSettings.x2 = canvasImgWidth - imgSettings.x1;
                imgSettings.y2 = canvasImgHeight - imgSettings.y1;
                drawCanvas();
                document.querySelector(".btn_download").addEventListener("click", downloadImg);
                document.querySelector(".btn_apply").addEventListener("click", applyAll);
                document.querySelector(".btn_reset").addEventListener("click", resetCssFilters);
                canvas.style.backgroundImage = "none";
                hidePreloader();
            });
            document.body.querySelectorAll('[type="range"]').forEach((el) => {
                el.disabled = false;
            });
        }
    }
    // Получаем ссылку из blob объекта для картинки и загружаем её
    function blobToImg(blob) {
        imgBlobBuffer = blob;
        return new Promise(resolve => {
            let img = new Image();
            img.onload = () => resolve(img);
            img.src = URL.createObjectURL(blob);
        }, reject => {
            alert("Error!");
        });
    }
    // перерисовка канваса
    function drawCanvas() {
        ctx.clearRect(0, 0, canvasImgWidth, canvasImgHeight);
        ctx.drawImage(canvasImg, 0, 0);
        applyCssFilters();
        ctx.beginPath();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.lineTo(0, 0);
        ctx.lineTo(canvasImgWidth, 0);
        ctx.lineTo(canvasImgWidth, canvasImgHeight);
        ctx.lineTo(0, canvasImgHeight);
        ctx.lineTo(0, 0);
        ctx.lineTo(imgSettings.x1, imgSettings.y1);
        ctx.lineTo(imgSettings.x1, imgSettings.y2);
        ctx.lineTo(imgSettings.x2, imgSettings.y2);
        ctx.lineTo(imgSettings.x2, imgSettings.y1);
        ctx.lineTo(imgSettings.x1, imgSettings.y1);
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 5;
        ctx.strokeRect(imgSettings.x1, imgSettings.y1, imgSettings.x2 - imgSettings.x1, imgSettings.y2 - imgSettings.y1);
    }
    // вызов плавной анимации
    function animation() {
        animationId = requestAnimationFrame(animation);
        drawCanvas();
    }
    //скачать картинку
    function downloadImg() {
        this.href = URL.createObjectURL(imgBlobBuffer);
    }

    fileInput.addEventListener("change", loadImg);
    //<<<<<<< end MAIN >>>>>>>/


    //<<<<<<< ZOOM >>>>>>>/

    function scalePlus() {
        if (canvasImg) {
            canvas.style.width = canvas.offsetWidth + 5 + "px";
            canvas.style.maxWidth = "none";
            plusIntervalId = setInterval(function () {
                canvas.style.width = canvas.offsetWidth + 5 + "px";
            }, 20);
        }
    }

    function scaleMinus() {
        if (canvasImg) {
            canvas.style.width = canvas.offsetWidth - 5 + "px";
            minusIntervalId = setInterval(function () {
                canvas.style.width = canvas.offsetWidth - 5 + "px";
            }, 20);
        }
    }

    function scaleReset() {
        if (canvasImg) {
            canvas.style.maxWidth = "100%";
            canvas.style.width = canvasImgWidth + "px";
        }
    }

    document.forms.tools.btnPlus.addEventListener("mousedown", scalePlus);
    document.forms.tools.btnPlus.addEventListener("touchstart", scalePlus);
    document.forms.tools.btnPlus.addEventListener("mouseup", () => {
        clearInterval(plusIntervalId);
    });
    document.forms.tools.btnPlus.addEventListener("touchend", () => {
        clearInterval(plusIntervalId);
    });

    document.forms.tools.btnMinus.addEventListener("mousedown", scaleMinus);
    document.forms.tools.btnMinus.addEventListener("touchstart", scaleMinus);
    document.forms.tools.btnMinus.addEventListener("mouseup", () => {
        clearInterval(minusIntervalId);
    });
    document.forms.tools.btnMinus.addEventListener("touchend", () => {
        clearInterval(minusIntervalId);
    });

    document.forms.tools.btnReset.addEventListener("mousedown", scaleReset);
    document.forms.tools.btnReset.addEventListener("touchstart", scaleReset);

    //<<<<<<< end ZOOM >>>>>>>/

    //<<<<<<<BORDERS & PROPORTIONS for crop >>>>>>>/

    // Определяем куда был клик и какие стороны меняем
    function defineSide(e) {
        scaleK = canvas.width / canvas.offsetWidth;

        if (e.type === "touchstart") {
            cursorPositionX = (e.changedTouches[0].pageX - canvas.getBoundingClientRect().left - pageXOffset) * scaleK;
            cursorPositionY = (e.changedTouches[0].pageY - canvas.getBoundingClientRect().top - pageYOffset) * scaleK;
        } else {

            cursorPositionX = e.offsetX * scaleK;
            cursorPositionY = e.offsetY * scaleK;
        }

        if (cursorPositionX < imgSettings.x1 + LIMIT_VAR && cursorPositionX > imgSettings.x1 - LIMIT_VAR && cursorPositionY < imgSettings.y1 + LIMIT_VAR && cursorPositionY > imgSettings.y1 - LIMIT_VAR) {
            x1 = y1 = true;
        } else if (cursorPositionX < imgSettings.x2 + LIMIT_VAR && cursorPositionX > imgSettings.x2 - LIMIT_VAR && cursorPositionY < imgSettings.y1 + LIMIT_VAR && cursorPositionY > imgSettings.y1 - LIMIT_VAR) {
            x2 = y1 = true;
        } else if (cursorPositionX < imgSettings.x2 + LIMIT_VAR && cursorPositionX > imgSettings.x2 - LIMIT_VAR && cursorPositionY < imgSettings.y2 + LIMIT_VAR && cursorPositionY > imgSettings.y2 - LIMIT_VAR) {
            x2 = y2 = true;
        } else if (cursorPositionX < imgSettings.x1 + LIMIT_VAR && cursorPositionX > imgSettings.x1 - LIMIT_VAR && cursorPositionY < imgSettings.y2 + LIMIT_VAR && cursorPositionY > imgSettings.y2 - LIMIT_VAR) {
            x1 = y2 = true;
        } else if (cursorPositionX < imgSettings.x1 + LIMIT_VAR && cursorPositionX > imgSettings.x1 - LIMIT_VAR && cursorPositionY > imgSettings.y1 + LIMIT_VAR && cursorPositionY < imgSettings.y2 - LIMIT_VAR) {
            x1 = true;
        } else if (cursorPositionX < imgSettings.x2 + LIMIT_VAR && cursorPositionX > imgSettings.x2 - LIMIT_VAR && cursorPositionY > imgSettings.y1 + LIMIT_VAR && cursorPositionY < imgSettings.y2 - LIMIT_VAR) {
            x2 = true;
        } else if (cursorPositionY < imgSettings.y1 + LIMIT_VAR && cursorPositionY > imgSettings.y1 - LIMIT_VAR && cursorPositionX > imgSettings.x1 + LIMIT_VAR && cursorPositionX < imgSettings.x2 - LIMIT_VAR) {
            y1 = true;
        } else if (cursorPositionY < imgSettings.y2 + LIMIT_VAR && cursorPositionY > imgSettings.y2 - LIMIT_VAR && cursorPositionX > imgSettings.x1 + LIMIT_VAR && cursorPositionX < imgSettings.x2 - LIMIT_VAR) {
            y2 = true;
        } else if (cursorPositionX > imgSettings.x1 + LIMIT_VAR && cursorPositionX < imgSettings.x2 - LIMIT_VAR && cursorPositionY > imgSettings.y1 + LIMIT_VAR && cursorPositionY < imgSettings.y2 - LIMIT_VAR) {
            x1 = y1 = x2 = y2 = true;
        }
    }

    function startDraw(e) {
        if (canvasImg) {
            animationId = requestAnimationFrame(animation);
            defineSide(e);
            if (e.type === "touchstart") {
                canvas.addEventListener("touchmove", borderResize);
            } else {
                canvas.addEventListener("mousemove", borderResize);
            }
        } else {
            document.getElementById("fileInput").dispatchEvent(new MouseEvent("click"));
        }
    }
    //меняем координаты при движении мышки
    function borderResize(e) {
        if (e.type === "touchmove") {
            cursorPositionX = (e.changedTouches[0].pageX - canvas.getBoundingClientRect().left - pageXOffset) * scaleK;
            cursorPositionY = (e.changedTouches[0].pageY - canvas.getBoundingClientRect().top - pageYOffset) * scaleK;
        } else {
            cursorPositionX = e.offsetX * scaleK;
            cursorPositionY = e.offsetY * scaleK;
        }
        if (x1 && x2 && y1 && y2) {
            imgSettings.x1 = Math.max((imgSettings.x1 + e.movementX), 0);
            imgSettings.x2 = Math.min((imgSettings.x2 + e.movementX), canvasImgWidth);
            imgSettings.y1 = Math.max((imgSettings.y1 + e.movementY), 0);
            imgSettings.y2 = Math.min((imgSettings.y2 + e.movementY), canvasImgHeight);
            return;
        }
        if (y1) {
            imgSettings.y1 = Math.max(cursorPositionY, 0);
        }
        if (y2) {
            imgSettings.y2 = Math.min(cursorPositionY, canvasImgHeight);
        }
        if (x1) {
            imgSettings.x1 = Math.max(cursorPositionX, 0);
        }
        if (x2) {
            imgSettings.x2 = Math.min(cursorPositionX, canvasImgWidth);
        }

    }

    function drawByProportions(propWidth, propHeight) {
        let borderWidth = canvasImgWidth;
        let borderHeight = (canvasImgWidth / propWidth) * propHeight;
        if (borderHeight > canvasImgHeight) {
            borderHeight = canvasImgHeight;
            borderWidth = (borderHeight / propHeight) * propWidth;
        }
        imgSettings.x1 = (canvasImgWidth - borderWidth) / 2;
        imgSettings.x2 = imgSettings.x1 + borderWidth;
        imgSettings.y1 = (canvasImgHeight - borderHeight) / 2;
        imgSettings.y2 = imgSettings.y1 + borderHeight;
        drawCanvas();
    }

    canvas.addEventListener("mousedown", (e) => {
        startDraw(e);
    });
    canvas.addEventListener("touchstart", (e) => {
        startDraw(e);
    });
    canvas.addEventListener("mouseup", (e) => {
        cancelAnimationFrame(animationId);
        canvas.removeEventListener("mousemove", borderResize);
        x1 = x2 = y1 = y2 = false;
    });
    canvas.addEventListener("touchend", (e) => {
        cancelAnimationFrame(animationId);
        canvas.removeEventListener("touchmove", borderResize);
        x1 = x2 = y1 = y2 = false;
    });
    canvas.addEventListener("mouseout", (e) => {
        cancelAnimationFrame(animationId);
        canvas.removeEventListener("mousemove", borderResize);
        x1 = x2 = y1 = y2 = false;
    });
    canvas.addEventListener("touchcancel", (e) => {
        cancelAnimationFrame(animationId);
        canvas.removeEventListener("touchmove", borderResize);
        x1 = x2 = y1 = y2 = false;
    });

    document.forms.tools.btn1x1.addEventListener("click", () => {
        if(canvasImg){
            drawByProportions(1, 1);
        }
    });
    document.forms.tools.btn4x3.addEventListener("click", () => {
        if(canvasImg){
            drawByProportions(4, 3);
        }
    });
    document.forms.tools.btn16x9.addEventListener("click", () => {
        if(canvasImg){
            drawByProportions(16, 9);
        }

    });
    document.forms.tools.proportionsWidth.addEventListener("keyup", () => {
       if(canvasImg){
           let valWidth = document.forms.tools.proportionsWidth.value;
           let valHeight = document.forms.tools.proportionsHeight.value;
           if (valWidth && valHeight) {
               drawByProportions(valWidth, valHeight);
           }
       }
    });
    document.forms.tools.proportionsHeight.addEventListener("keyup", () => {
        if(canvasImg){
            let valWidth = document.forms.tools.proportionsWidth.value;
            let valHeight = document.forms.tools.proportionsHeight.value;
            if (valWidth && valHeight) {
                drawByProportions(valWidth, valHeight);
            }
        }
    });

    //<<<<<<< end PROPORTIONS for crop >>>>>>>/

    //<<<<<<< FILTERS >>>>>>>/

    function applyCssFilters() {
        canvas.style.filter = "brightness(" + imgSettings.filterBrightness + ")" + " contrast(" + imgSettings.filterContrast + ")" + " hue-rotate(" + imgSettings.filterHueRotate + "deg)" + " saturate(" + imgSettings.filterSaturate + ")" + " grayscale(" + imgSettings.filterGrayscale + ")" + " sepia(" + imgSettings.filterSepia + ")" + " invert(" + imgSettings.filterInvert + ")" + " blur(" + imgSettings.filterBlur + "px)" + " opacity(" + imgSettings.filterOpacity + ")";
    }

    function resetCssFilters() {
        imgSettings.filterBrightness = 1;
        imgSettings.filterContrast = 1;
        imgSettings.filterHueRotate = 0;
        imgSettings.filterSaturate = 1;
        imgSettings.filterGrayscale = 0;
        imgSettings.filterSepia = 0;
        imgSettings.filterInvert = 0;
        imgSettings.filterBlur = 0;
        imgSettings.filterOpacity = 1;
        document.getElementById("filterBrightness").value = 1;
        document.getElementById("filterContrast").value = 1;
        document.getElementById("filterHueRotate").value = 0;
        document.getElementById("filterSaturate").value = 1;
        document.getElementById("filterGrayscale").value = 0;
        document.getElementById("filterSepia").value = 0;
        document.getElementById("filterInvert").value = 0;
        document.getElementById("filterBlur").value = 0;
        document.getElementById("filterOpacity").value = 1;
    }
    //применяем фильтры
    function applyJsFilters() {
        ctx.filter = "brightness(" + imgSettings.filterBrightness + ")" + " contrast(" + imgSettings.filterContrast + ")" + " hue-rotate(" + imgSettings.filterHueRotate + "deg)" + " saturate(" + imgSettings.filterSaturate + ")" + " grayscale(" + imgSettings.filterGrayscale + ")" + " sepia(" + imgSettings.filterSepia + ")" + " invert(" + imgSettings.filterInvert + ")" + " blur(" + imgSettings.filterBlur + "px)" + " opacity(" + imgSettings.filterOpacity + ")";
    }

    function resetJsFilters() {
        ctx.filter = "brightness(1) contrast(1) hue-rotate(0) saturate(1) grayscale(0) sepia(0) invert(0) blur(0) opacity(1)";
    }

    function applyAll() {
        showPreloader(document.querySelector(".canvas-wrapper"));
        new Promise(resolve => {
            canvasImgWidth = imgSettings.x2 - imgSettings.x1;
            canvasImgHeight = imgSettings.y2 - imgSettings.y1;
            canvas.width = canvasImgWidth;
            canvas.height = canvasImgHeight;
            ctx.clearRect(0, 0, canvasImgWidth, canvasImgHeight);
            applyJsFilters();
            ctx.drawImage(canvasImg, imgSettings.x1, imgSettings.y1, canvasImgWidth, canvasImgHeight, 0, 0, canvasImgWidth, canvasImgHeight);

            canvas.toBlob((blob) => {
                imgBlobBuffer = blob;
            });
            imgDataUrl = canvas.toDataURL();
            let newImg = new Image();
            newImg.onload = () => resolve(newImg);
            newImg.src = imgDataUrl;
        }, reject => {
            alert("Error!");
        }).then(newImg => {
            canvasImg = newImg;

            imgSettings.x1 = imgSettings.y1 = POSITION_START_BORDERS;
            imgSettings.y2 = canvasImgHeight - imgSettings.y1;
            imgSettings.x2 = canvasImgWidth - imgSettings.x1;

            resetCssFilters();
            resetJsFilters();
            drawCanvas();
            hidePreloader();

        });
    }
    document.forms.tools.querySelectorAll("input[type='range']").forEach((el) => {
        el.addEventListener("click", () => {
            imgSettings[el.id] = Number(el.value);
            drawCanvas();
        });
        el.addEventListener("mousedown", () => {
            if (canvasImg) {
                animationId = requestAnimationFrame(animation);
            }
        });
        el.addEventListener("touchstart", () => {
            if (canvasImg) {
                animationId = requestAnimationFrame(animation);
            }
        });

        el.addEventListener("mousemove", () => {
            if (canvasImg) {
                imgSettings[el.id] = Number(el.value);
            }
        });
        el.addEventListener("touchmove", () => {
            if (canvasImg) {
                imgSettings[el.id] = Number(el.value);
            }
        });
        el.addEventListener("mouseup", () => {
            drawCanvas();
            cancelAnimationFrame(animationId);
        });
        el.addEventListener("touchend", () => {
            drawCanvas();
            cancelAnimationFrame(animationId);
        });
    });
    document.querySelector(".btn_reset").addEventListener("click", () => {
        resetCssFilters();
        drawCanvas();
    });
    //<<<<<<< end FILTERS >>>>>>>/


    //<<<<<<< IndexedDB >>>>>>>/
    // Пуш картинки в db
    document.getElementById("btnSaveImg").addEventListener("click", () => {
        if (canvasImg) {
            let photo = new Photo(canvasImg);
                let transaction = db.transaction([STORE_NAME], "readwrite");
                let objectStore = transaction.objectStore(STORE_NAME);
                let request = objectStore.add(photo);
                request.onsuccess = function(){
                    alert("Done!");
                    // if (confirm("Photo added in your gallary. Do you want to go to Wall editor?")) {
                    //     document.getElementById("wallEditor").dispatchEvent(new MouseEvent("click"));
                    // }

                };



        }
    });

    //<<<<<<< end IndexedDB >>>>>>>/
}());