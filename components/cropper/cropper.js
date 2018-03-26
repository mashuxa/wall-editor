"use strict";
const APP_NAME = "Photo Walls";
const LIMIT_VAR = 25;
const POSITION_START_BORDERS = 50;
const NEW_IMG_NAME = "photo_walls_editor_image.png";
// for reset
let originalImg;
// work variables
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

//<<<<<<< MAIN >>>>>>>//
function loadImg() {
    let isContinueChange = true;
    if (canvasImg) {
        isContinueChange = confirm("The current image will be overwritten. Are you sure you want to continue?");
    }
    if (isContinueChange && fileInput.files[0]) {
        // вызываем функццию для получения img и передаем blob объект полученный из fileInput.
        blobToImg(fileInput.files[0]).then(img => {
            originalImg = img;
            canvasImg = img;
            canvasImgWidth = canvasImg.width;
            canvasImgHeight = canvasImg.height;
            canvas.width = canvasImgWidth;
            canvas.height = canvasImgHeight;
            imgSettings.x2 = canvasImgWidth - imgSettings.x1;
            imgSettings.y2 = canvasImgHeight - imgSettings.y1;

            drawCanvas();

            document.querySelector(".btn_download").addEventListener("click", downloadImg);
            document.querySelector(".btn_apply").addEventListener("click", ()=>{

                cropImg();
                // ДОБАВИТЬ ФУНКЦИЮ КОТОРОЯ ПРИМЕНИТ ФИЛЬРЫ К ОРИГИНАЛЬНОМУ СКАЧИВАЕМОМУ ИЗОБРАЖЕНИЮ
                applyFilters();
            });

            canvas.style.backgroundImage = "none";
        });
    }
}

// Получаем ссылку из blob объекта для картинки и загружаем её
function blobToImg(blob) {
    return new Promise(resolve => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.src = URL.createObjectURL(blob);
    }, reject => {
        alert("Error!");
    });
}

//фильтры
function applyFilters(ctx) {
    ctx.filter = "brightness(" + imgSettings.filterBrightness + ")" + " contrast(" + imgSettings.filterContrast + ")" + " hue-rotate(" + imgSettings.filterHueRotate + "deg)" + " saturate(" + imgSettings.filterSaturate + ")" + " grayscale(" + imgSettings.filterGrayscale + ")" + " sepia(" + imgSettings.filterSepia + ")" + " invert(" + imgSettings.filterInvert + ")" + " blur(" + imgSettings.filterBlur + "px)" + " opacity(" + imgSettings.filterOpacity + ")";
}

// перерисовка канваса
function drawCanvas() {


    ctx.clearRect(0, 0, canvasImgWidth, canvasImgHeight);
    ctx.drawImage(canvasImg, 0, 0);


    applyFilters(ctx);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
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

//меняем координаты при движении мышки
function borderResize(e) {
    cursorPositionX = e.offsetX * scaleK;
    cursorPositionY = e.offsetY * scaleK;
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

// кропнуть картинку
function cropImg() {
    canvasImgWidth = imgSettings.x2 - imgSettings.x1;
    canvasImgHeight = imgSettings.y2 - imgSettings.y1;
    canvas.width = canvasImgWidth;
    canvas.height = canvasImgHeight;
    ctx.clearRect(0, 0, canvasImgWidth, canvasImgHeight);
    ctx.drawImage(canvasImg, imgSettings.x1, imgSettings.y1, canvasImgWidth, canvasImgHeight, 0, 0, canvasImgWidth, canvasImgHeight);
    new Promise(resolve => {
        let dataUrl = canvas.toDataURL();
        let newImg = new Image();
        newImg.onload = () => resolve(newImg);
        newImg.src = dataUrl;
    }, reject => {
        alert("Error!");
    }).then(newImg => {
        canvasImg = newImg;
        imgSettings.x1 = imgSettings.y1 = 20;
        imgSettings.y2 = canvasImgHeight - imgSettings.y1;
        imgSettings.x2 = canvasImgWidth - imgSettings.x1;
        drawCanvas();
    });
}


//скачать картинку
function downloadImg() {
    let a = document.createElement("a");
    a.href = canvasImg.src;
    a.download = NEW_IMG_NAME;
    a.dispatchEvent(new MouseEvent("click"));
}

fileInput.addEventListener("change", loadImg);
canvas.addEventListener("mousedown", function (e) {
    if (canvasImg) {
        animationId = requestAnimationFrame(animation);
        scaleK = canvas.width / canvas.offsetWidth;
        cursorPositionX = e.offsetX * scaleK;
        cursorPositionY = e.offsetY * scaleK;
// Определяем куда был клик и какие стороны меняем
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
        canvas.addEventListener("mousemove", borderResize);
    } else {
        document.getElementById("fileInput").dispatchEvent(new MouseEvent("click"));
    }
});
canvas.addEventListener("mouseup", function (e) {
    cancelAnimationFrame(animationId);
    canvas.removeEventListener("mousemove", borderResize);
    x1 = x2 = y1 = y2 = 0;
});
canvas.addEventListener("mouseout", function (e) {
    cancelAnimationFrame(animationId);
    canvas.removeEventListener("mousemove", borderResize);
});

//<<<<<<< end MAIN >>>>>>>/


//<<<<<<< ZOOM >>>>>>>/

document.forms.tools.btnPlus.addEventListener("mousedown", () => {

    if (canvasImg) {
        canvas.style.width = canvas.offsetWidth + 5 + "px";
        canvas.style.maxWidth = "none";
        plusIntervalId = setInterval(function () {
            canvas.style.width = canvas.offsetWidth + 5 + "px";
        }, 20);
    }
});
document.forms.tools.btnPlus.addEventListener("mouseup", () => {
    clearInterval(plusIntervalId);
});
document.forms.tools.btnMinus.addEventListener("mousedown", () => {
    if (canvasImg) {
        minusIntervalId = setInterval(function () {
            canvas.style.width = canvas.offsetWidth - 5 + "px";
        }, 20);
    }
});
document.forms.tools.btnMinus.addEventListener("mouseup", () => {
    clearInterval(minusIntervalId);
});
document.forms.tools.btnReset.addEventListener("mousedown", () => {
    if (canvasImg) {
        canvas.style.maxWidth = "100%";
        canvas.style.width = canvasImgWidth + "px";
    }
    drawCanvas();
});

//<<<<<<< end ZOOM >>>>>>>/


//<<<<<<< PROPORTIONS for crop >>>>>>>/
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

document.forms.tools.btn1x1.addEventListener("click", () => {
    drawByProportions(1, 1);
});
document.forms.tools.btn4x3.addEventListener("click", () => {
    drawByProportions(4, 3);
});
document.forms.tools.btn16x9.addEventListener("click", () => {
    drawByProportions(16, 9);
});
document.forms.tools.proportionsWidth.addEventListener("keyup", () => {
    let valWidth = document.forms.tools.proportionsWidth.value;
    let valHeight = document.forms.tools.proportionsHeight.value;
    if (valWidth && valHeight) {
        drawByProportions(valWidth, valHeight);
    }
});
document.forms.tools.proportionsHeight.addEventListener("keyup", () => {
    let valWidth = document.forms.tools.proportionsWidth.value;
    let valHeight = document.forms.tools.proportionsHeight.value;
    if (valWidth && valHeight) {
        drawByProportions(valWidth, valHeight);
    }
});
//<<<<<<< end PROPORTIONS for crop >>>>>>>/


//<<<<<<< FILTERS >>>>>>>/

document.forms.tools.filterBrightness.addEventListener("click", () => {
});
document.forms.tools.querySelectorAll("input[type='range']").forEach((el) => {
    el.addEventListener("click", () => {
        imgSettings[el.id] = Number(el.value);
        drawCanvas();
    });
    el.addEventListener("mousedown", () => {
        if (canvasImg) {


            animationId = requestAnimationFrame(animation);
        } else {

        }
    });
    el.addEventListener("mousemove", () => {
        if (canvasImg) {
            imgSettings[el.id] = Number(el.value);
        }
    });
    el.addEventListener("mouseup", () => {
        cancelAnimationFrame(animationId);
    });
});
//<<<<<<< end FILTERS >>>>>>>/
