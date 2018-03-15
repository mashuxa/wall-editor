"use strict";

let imgCanvas = document.getElementById("currentImg");
let borderCanvas = document.getElementById("cropperBorder");

let fileInput = document.getElementById("fileImage");
let imgWidth, imgHeight;

let borderPositionLeft, borderPositionRight, borderPositionTop, borderPositionBottom;
let borderWidth;
let borderHeight;
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


    borderWidth = borderPositionRight - borderPositionLeft;
    borderHeight = borderPositionBottom - borderPositionTop;

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
    if (isMouseDown) {
        animationId = window.requestAnimationFrame(drawBorder);
    }
    if (cursorPositionX < borderPositionLeft + 25 && cursorPositionX > borderPositionLeft - 25 && cursorPositionY < borderPositionTop + 25 && cursorPositionY > borderPositionTop - 25){
        if (isMouseDown) {
            borderPositionLeft = cursorPositionX;
            borderPositionTop = cursorPositionY;
        }
    } else if (cursorPositionX < borderPositionRight + 25 && cursorPositionX > borderPositionRight - 25 && cursorPositionY < borderPositionTop + 25 && cursorPositionY > borderPositionTop - 25) {
        if (isMouseDown) {
            borderPositionRight = cursorPositionX;
            borderPositionTop = cursorPositionY;
        }
        } else if (cursorPositionX < borderPositionRight + 25 && cursorPositionX > borderPositionRight - 25 && cursorPositionY < borderPositionBottom + 25 && cursorPositionY > borderPositionBottom - 25) {
        if (isMouseDown) {
            borderPositionRight = cursorPositionX;
            borderPositionBottom = cursorPositionY;
        }
    } else if (cursorPositionX < borderPositionLeft + 25 && cursorPositionX > borderPositionLeft - 25 && cursorPositionY < borderPositionBottom + 25 && cursorPositionY > borderPositionBottom - 25) {
        if (isMouseDown) {
            borderPositionLeft = cursorPositionX;
            borderPositionBottom = cursorPositionY;
        }
    }
    else if (cursorPositionX < borderPositionLeft + 25 && cursorPositionX > borderPositionLeft - 25 && cursorPositionY > borderPositionTop + 25 && cursorPositionY < borderPositionBottom - 25) {
        if (isMouseDown) {
            borderPositionLeft = cursorPositionX;
        }
    } else if (cursorPositionX < borderPositionRight + 25 && cursorPositionX > borderPositionRight - 25 && cursorPositionY > borderPositionTop + 25 && cursorPositionY < borderPositionBottom - 25) {
        if (isMouseDown) {
            borderPositionRight = cursorPositionX;
        }
    } else if (cursorPositionY < borderPositionTop + 25 && cursorPositionY > borderPositionTop - 25 && cursorPositionX > borderPositionLeft + 25 && cursorPositionX < borderPositionRight - 25) {
        if (isMouseDown) {
            borderPositionTop = cursorPositionY;
        }
    } else if (cursorPositionY < borderPositionBottom + 25 && cursorPositionY > borderPositionBottom - 25 && cursorPositionX > borderPositionLeft + 25 && cursorPositionX < borderPositionRight - 25) {
        if (isMouseDown) {
            borderPositionBottom = cursorPositionY;
        }
    }
});
borderCanvas.addEventListener("mouseup", function (e) {
    if (isLeftButton(e)) {
        isMouseDown = false;
    }
    window.cancelAnimationFrame(animationId);
});


document.querySelector(".btn_crop").addEventListener("click", function(){
    let ctx = imgCanvas.getContext("2d");
    let dataUrl = imgCanvas.toDataURL();
    imgWidth = borderWidth;
    imgHeight = borderHeight;


    new Promise(resolve => {
        let newImg = new Image();
        newImg.onload = () => resolve(newImg);
        newImg.src = dataUrl;
    }).then(newImg => {

        ctx.clearRect(0, 0, imgWidth, imgWidth);
        // imgCanvas.height = imgHeight;
        // imgCanvas.width = imgWidth;
        ctx.drawImage(newImg, 0, 0);
        drawBorder();
    });



});