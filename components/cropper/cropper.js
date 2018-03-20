"use strict";
const LIMIT_VAR = 25;

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
    console.log(animationId);
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
    animationId = requestAnimationFrame(drawCanvas);
}

//меняем координаты при движении мышки
function borderResize(e) {
    cursorPositionX = e.offsetX * scaleK;
    cursorPositionY = e.offsetY * scaleK;

    if (y1) {
        borderPosition.y1 = cursorPositionY;
    }
    if (y2) {
        borderPosition.y2 = cursorPositionY;
    }
    if (x1) {
        borderPosition.x1 = cursorPositionX;
    }
    if (x2) {
        borderPosition.x2 = cursorPositionX;
    }
}

// кропнуть картинку
function cropImg() {
    let dataUrl = canvas.toDataURL();
    canvasImgWidth = borderPosition.x2 - borderPosition.x1;
    canvasImgHeight = borderPosition.y2 - borderPosition.y1;

    new Promise(resolve => {
        let newImg = new Image();
        newImg.onload = () => resolve(newImg);
        newImg.src = dataUrl;
    }).then(newImg => {
        canvas.width = canvasImgWidth;
        canvas.height = canvasImgHeight;
        ctx.clearRect(0, 0, canvasImgWidth, canvasImgHeight);

        ctx.drawImage(newImg, borderPosition.x1, borderPosition.y1, canvasImgWidth, canvasImgHeight, 0, 0, canvasImgWidth, canvasImgHeight);
        borderPosition.x1 = borderPosition.y1 = 20;
        borderPosition.y2 = canvasImgHeight - borderPosition.y1;
        borderPosition.x2 = canvasImgWidth -borderPosition.x1;
    });
}

//скачать картинку
function downloadImg() {
    imgCanvas.toBlob(blob => {
        let url = URL.createObjectURL(blob);
        let a = document.createElement("a");
        a.href = url;
        a.download = "image.png";
        a.dispatchEvent(new MouseEvent("click"));
    });
}


fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) {
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

            // requestAnimationFrame(drawCanvas);
            drawCanvas();
            document.querySelector(".btn_download").addEventListener("click", downloadImg);
            document.querySelector(".btn_cut-off").addEventListener("click", cropImg);
        });
    }
});
canvas.addEventListener("mousedown", function (e) {
    scaleK = canvas.width / canvas.offsetWidth;
    cursorPositionX = e.offsetX * scaleK;
    cursorPositionY = e.offsetY * scaleK;
// ПЕРЕДЕЛАТЬ НА СВИТЧКЕЙС
    if (cursorPositionX < borderPosition.x1 + LIMIT_VAR && cursorPositionX > borderPosition.x1 - LIMIT_VAR && cursorPositionY < borderPosition.y1 + LIMIT_VAR && cursorPositionY > borderPosition.y1 - LIMIT_VAR) {
        x1 = y1 = 1;
    } else if (cursorPositionX < borderPosition.x2 + LIMIT_VAR && cursorPositionX > borderPosition.x2 - LIMIT_VAR && cursorPositionY < borderPosition.y1 + LIMIT_VAR && cursorPositionY > borderPosition.y1 - LIMIT_VAR) {
        x2 = y1 = 1;
    } else if (cursorPositionX < borderPosition.x2 + LIMIT_VAR && cursorPositionX > borderPosition.x2 - LIMIT_VAR && cursorPositionY < borderPosition.y2 + LIMIT_VAR && cursorPositionY > borderPosition.y2 - LIMIT_VAR) {
        x2 = y2 = 1;
    } else if (cursorPositionX < borderPosition.x1 + LIMIT_VAR && cursorPositionX > borderPosition.x1 - LIMIT_VAR && cursorPositionY < borderPosition.y2 + LIMIT_VAR && cursorPositionY > borderPosition.y2 - LIMIT_VAR) {
        x1 = y2 = 1;
    } else if (cursorPositionX > borderPosition.x1 + LIMIT_VAR && cursorPositionX < borderPosition.x2 - LIMIT_VAR && cursorPositionY > borderPosition.y1 + LIMIT_VAR && cursorPositionY < borderPosition.y2 - LIMIT_VAR) {
        // borderPosition.x1 = borderPosition.x1 + deltaX;
        // borderPosition.y1 = borderPosition.y1 + deltaY;
        // borderPosition.x2 = borderPosition.x2 + deltaX;
        // borderPosition.y2 = borderPosition.y2 + deltaY;
    } else if (cursorPositionX < borderPosition.x1 + LIMIT_VAR && cursorPositionX > borderPosition.x1 - LIMIT_VAR && cursorPositionY > borderPosition.y1 + LIMIT_VAR && cursorPositionY < borderPosition.y2 - LIMIT_VAR) {
        x1 = 1;
    } else if (cursorPositionX < borderPosition.x2 + LIMIT_VAR && cursorPositionX > borderPosition.x2 - LIMIT_VAR && cursorPositionY > borderPosition.y1 + LIMIT_VAR && cursorPositionY < borderPosition.y2 - LIMIT_VAR) {
        x2 = 1;
    } else if (cursorPositionY < borderPosition.y1 + LIMIT_VAR && cursorPositionY > borderPosition.y1 - LIMIT_VAR && cursorPositionX > borderPosition.x1 + LIMIT_VAR && cursorPositionX < borderPosition.x2 - LIMIT_VAR) {
        y1 = 1;
    } else if (cursorPositionY < borderPosition.y2 + LIMIT_VAR && cursorPositionY > borderPosition.y2 - LIMIT_VAR && cursorPositionX > borderPosition.x1 + LIMIT_VAR && cursorPositionX < borderPosition.x2 - LIMIT_VAR) {
        y2 = 1;
    } else {
    }
    canvas.addEventListener("mousemove", borderResize);
});
canvas.addEventListener("mouseup", function (e) {
    canvas.removeEventListener("mousemove", borderResize);
    x1 = x2 = y1 = y2 = 0;
    cancelAnimationFrame(animationId);
});