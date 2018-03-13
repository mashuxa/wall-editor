"use strict";

let imgCanvas = document.getElementById("currentImg");
let borderCanvas = document.getElementById("cropperBorder");

let fileInput = document.getElementById("fileImage");
let imgWidth, imgHeight;

let borderPositionLeft, borderPositionRight, borderPositionTop, borderPositionBottom;
let cursorPositionX, cursorPositionY;
let animationId;
let isMouseDown = false;

function blobToImg(blob) {
    return new Promise(resolve => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.src = URL.createObjectURL(blob);
    });
}


fileInput.addEventListener("change", () => {
    if (fileInput.files[0]) {
        blobToImg(fileInput.files[0]).then(img => {
            let ctx = imgCanvas.getContext("2d");
            imgWidth = img.width;
            imgHeight = img.height;

            imgCanvas.height = imgHeight;
            imgCanvas.width = imgWidth;
            ctx.drawImage(img, 0, 0);
            drawBorder();


            document.querySelector(".btn_download").addEventListener("click", () => {
                imgCanvas.toBlob(blob => {
                    let url = URL.createObjectURL(blob);
                    let a = document.createElement("a");
                    a.href = url;
                    a.download = "image.png";
                    a.dispatchEvent(new MouseEvent("click"));
                });
            });
        });

    }
});

function drawBorder() {


    borderPositionLeft = borderPositionLeft || imgWidth / 4;
    borderPositionTop = borderPositionTop || imgHeight / 4;
    borderPositionRight = borderPositionRight || borderPositionLeft + imgWidth / 2;
    borderPositionBottom = borderPositionBottom || borderPositionTop + imgHeight / 2;


    let borderWidth = borderPositionRight - borderPositionLeft;
    let borderHeight = borderPositionBottom - borderPositionTop;

    borderCanvas.width = imgWidth;
    borderCanvas.height = imgHeight;
    let ctx = borderCanvas.getContext("2d");
    // очищаем
    ctx.clearRect(0, 0, imgWidth, imgWidth);
    // заливаем черным 50% alfa
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, imgWidth, imgHeight);
    ctx.lineWidth = 5;
    // рисуем рамку
    ctx.strokeRect(borderPositionLeft, borderPositionTop, borderWidth, borderHeight);
    // вырезаем рамку
    ctx.clearRect(borderPositionLeft, borderPositionTop, borderWidth, borderHeight);
}


//Добавит эти классы
// &_active-x{
// }
// &_active-y{
// }
// &_active-top-left-bottom-right{
// }
// &_active-bottom-left-top-right{
// }


// let animationId = window.requestAnimationFrame(drawBorder, this);
// window.cancelAnimationFrame(animationId);


function isLeftButton(e) {
    let button = e.which ? e.which : e.button;
    return button < 2;
}

borderCanvas.addEventListener("mousedown", function (e) {
    if (isLeftButton(e)) {
        isMouseDown = true;
    }
});


borderCanvas.addEventListener("mousemove", function (e) {
    let scaleK = borderCanvas.width / borderCanvas.offsetWidth;
    cursorPositionX = e.offsetX * scaleK;
    cursorPositionY = e.offsetY * scaleK;
    if (
        (cursorPositionX < borderPositionLeft + 5 && cursorPositionX > borderPositionLeft - 5 && cursorPositionY < borderPositionTop + 5 && cursorPositionY > borderPositionTop - 5) ||
        (cursorPositionX < borderPositionRight + 5 && cursorPositionX > borderPositionRight - 5 && cursorPositionY < borderPositionBottom + 5 && cursorPositionY > borderPositionBottom - 5)
    ) {
        console.log("верх лево или низ право");
        if (isMouseDown) {
            borderPositionLeft = cursorPositionX;
            animationId = window.requestAnimationFrame(drawBorder);
        }
    } else if (
        (cursorPositionX < borderPositionLeft + 5 && cursorPositionX > borderPositionLeft - 5 && cursorPositionY < borderPositionBottom + 5 && cursorPositionY > borderPositionBottom - 5) ||
        (cursorPositionX < borderPositionRight + 5 && cursorPositionX > borderPositionRight - 5 && cursorPositionY < borderPositionTop + 5 && cursorPositionY > borderPositionTop - 5)
    ) {
        if (isMouseDown) {
            borderPositionLeft = cursorPositionX;
            animationId = window.requestAnimationFrame(drawBorder);
        } else if (cursorPositionX < borderPositionLeft + 10 && cursorPositionX > borderPositionLeft - 10 && cursorPositionY > borderPositionTop + 10 && cursorPositionY < borderPositionBottom - 10) {
            // borderCanvas.classList.toggle("active");
            if (isMouseDown) {
                borderPositionLeft = cursorPositionX;
                animationId = window.requestAnimationFrame(drawBorder);
            }
        } else if (cursorPositionX < borderPositionRight + 10 && cursorPositionX > borderPositionRight - 10 && cursorPositionY > borderPositionTop + 10 && cursorPositionY < borderPositionBottom - 10) {
            if (isMouseDown) {
                borderPositionRight = cursorPositionX;
                animationId = window.requestAnimationFrame(drawBorder);
            }
        } else if (cursorPositionY < borderPositionTop + 10 && cursorPositionY > borderPositionTop - 10 && cursorPositionX > borderPositionLeft + 10 && cursorPositionX < borderPositionRight - 10) {
            if (isMouseDown) {
                borderPositionTop = cursorPositionY;
                animationId = window.requestAnimationFrame(drawBorder);
            }
        } else if (cursorPositionY < borderPositionBottom + 10 && cursorPositionY > borderPositionBottom - 10 && cursorPositionX > borderPositionLeft + 10 && cursorPositionX < borderPositionRight - 10) {
            if (isMouseDown) {
                borderPositionBottom = cursorPositionY;
                animationId = window.requestAnimationFrame(drawBorder);
            }
        }
        // console.log(borderPositionLeft);

    }
);


borderCanvas.addEventListener("mouseup", function (e) {
    if (isLeftButton(e)) {
        isMouseDown = false;
    }
    window.cancelAnimationFrame(animationId);
});


function crop() {

}