"use strict";
const APP_NAME = "Photo Walls";
const LIMIT_VAR = 25;
const NEW_IMG_NAME = "photo_walls_editor_image.png";
// for reset
let originalImg;
// work variables
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let fileInput = document.getElementById("fileInput");
let canvasImg, canvasImgWidth, canvasImgHeight;
let borderPosition = {
    x1: 50,
    y1: 50
};
let cursorPositionX, cursorPositionY;

let animationId;
let scaleK;
let x1, x2, y1, y2;
//<<<<<<< MAIN >>>>>>>//
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
// перерисовка канваса
function drawCanvas() {
    ctx.clearRect(0, 0, canvasImgWidth, canvasImgHeight);
    ctx.drawImage(canvasImg, 0, 0);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.lineTo(0, 0);
    ctx.lineTo(canvasImgWidth, 0);
    ctx.lineTo(canvasImgWidth, canvasImgHeight);
    ctx.lineTo(0, canvasImgHeight);
    ctx.lineTo(0, 0);
    ctx.lineTo(borderPosition.x1, borderPosition.y1);
    ctx.lineTo(borderPosition.x1, borderPosition.y2);
    ctx.lineTo(borderPosition.x2, borderPosition.y2);
    ctx.lineTo(borderPosition.x2, borderPosition.y1);
    ctx.lineTo(borderPosition.x1, borderPosition.y1);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeRect(borderPosition.x1, borderPosition.y1, borderPosition.x2 - borderPosition.x1, borderPosition.y2 - borderPosition.y1);
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
        borderPosition.x1 = Math.max((borderPosition.x1 + e.movementX), 0);
        borderPosition.x2 = Math.min((borderPosition.x2 + e.movementX), canvasImgWidth);
        borderPosition.y1 = Math.max((borderPosition.y1 + e.movementY), 0);
        borderPosition.y2 = Math.min((borderPosition.y2 + e.movementY), canvasImgHeight);
        return;
    }
    if (y1) {
        borderPosition.y1 = Math.max(cursorPositionY, 0);
    }
    if (y2) {
        borderPosition.y2 = Math.min(cursorPositionY, canvasImgHeight);
    }
    if (x1) {
        borderPosition.x1 = Math.max(cursorPositionX, 0);
    }
    if (x2) {
        borderPosition.x2 = Math.min(cursorPositionX, canvasImgWidth);
    }
}
// кропнуть картинку
function cropImg() {
    canvasImgWidth = borderPosition.x2 - borderPosition.x1;
    canvasImgHeight = borderPosition.y2 - borderPosition.y1;
    canvas.width = canvasImgWidth;
    canvas.height = canvasImgHeight;
    ctx.clearRect(0, 0, canvasImgWidth, canvasImgHeight);
    ctx.drawImage(canvasImg, borderPosition.x1, borderPosition.y1, canvasImgWidth, canvasImgHeight, 0, 0, canvasImgWidth, canvasImgHeight);
    new Promise(resolve => {
        let dataUrl = canvas.toDataURL();
        let newImg = new Image();
        newImg.onload = () => resolve(newImg);
        newImg.src = dataUrl;
    }, reject => {
        alert("Error!");
    }).then(newImg => {
        canvasImg = newImg;
        borderPosition.x1 = borderPosition.y1 = 20;
        borderPosition.y2 = canvasImgHeight - borderPosition.y1;
        borderPosition.x2 = canvasImgWidth - borderPosition.x1;
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
fileInput.addEventListener("change", () => {
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
            borderPosition.x2 = canvasImgWidth - borderPosition.x1;
            borderPosition.y2 = canvasImgHeight - borderPosition.y1;

            drawCanvas();

            document.querySelector(".btn_download").addEventListener("click", downloadImg);
            document.querySelector(".btn_cut-off").addEventListener("click", cropImg);
        });
    }
});
canvas.addEventListener("mousedown", function (e) {
    animationId = requestAnimationFrame(animation);
    scaleK = canvas.width / canvas.offsetWidth;
    cursorPositionX = e.offsetX * scaleK;
    cursorPositionY = e.offsetY * scaleK;
// Определяем куда был клик и какие стороны меняем
    if (cursorPositionX < borderPosition.x1 + LIMIT_VAR && cursorPositionX > borderPosition.x1 - LIMIT_VAR && cursorPositionY < borderPosition.y1 + LIMIT_VAR && cursorPositionY > borderPosition.y1 - LIMIT_VAR) {
        x1 = y1 = true;
    } else if (cursorPositionX < borderPosition.x2 + LIMIT_VAR && cursorPositionX > borderPosition.x2 - LIMIT_VAR && cursorPositionY < borderPosition.y1 + LIMIT_VAR && cursorPositionY > borderPosition.y1 - LIMIT_VAR) {
        x2 = y1 = true;
    } else if (cursorPositionX < borderPosition.x2 + LIMIT_VAR && cursorPositionX > borderPosition.x2 - LIMIT_VAR && cursorPositionY < borderPosition.y2 + LIMIT_VAR && cursorPositionY > borderPosition.y2 - LIMIT_VAR) {
        x2 = y2 = true;
    } else if (cursorPositionX < borderPosition.x1 + LIMIT_VAR && cursorPositionX > borderPosition.x1 - LIMIT_VAR && cursorPositionY < borderPosition.y2 + LIMIT_VAR && cursorPositionY > borderPosition.y2 - LIMIT_VAR) {
        x1 = y2 = true;
    } else if (cursorPositionX < borderPosition.x1 + LIMIT_VAR && cursorPositionX > borderPosition.x1 - LIMIT_VAR && cursorPositionY > borderPosition.y1 + LIMIT_VAR && cursorPositionY < borderPosition.y2 - LIMIT_VAR) {
        x1 = true;
    } else if (cursorPositionX < borderPosition.x2 + LIMIT_VAR && cursorPositionX > borderPosition.x2 - LIMIT_VAR && cursorPositionY > borderPosition.y1 + LIMIT_VAR && cursorPositionY < borderPosition.y2 - LIMIT_VAR) {
        x2 = true;
    } else if (cursorPositionY < borderPosition.y1 + LIMIT_VAR && cursorPositionY > borderPosition.y1 - LIMIT_VAR && cursorPositionX > borderPosition.x1 + LIMIT_VAR && cursorPositionX < borderPosition.x2 - LIMIT_VAR) {
        y1 = true;
    } else if (cursorPositionY < borderPosition.y2 + LIMIT_VAR && cursorPositionY > borderPosition.y2 - LIMIT_VAR && cursorPositionX > borderPosition.x1 + LIMIT_VAR && cursorPositionX < borderPosition.x2 - LIMIT_VAR) {
        y2 = true;
    } else if (cursorPositionX > borderPosition.x1 + LIMIT_VAR && cursorPositionX < borderPosition.x2 - LIMIT_VAR && cursorPositionY > borderPosition.y1 + LIMIT_VAR && cursorPositionY < borderPosition.y2 - LIMIT_VAR) {
        x1 = y1 = x2 = y2 = true;
    }
    canvas.addEventListener("mousemove", borderResize);
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


//<<<<<<< MAIN >>>>>>>/