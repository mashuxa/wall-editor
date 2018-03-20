"use strict";

let imgCanvas = document.getElementById("currentImg");
let borderCanvas = document.getElementById("cropperBorder");
let fileInput = document.getElementById("fileImage");

let imgWidth, imgHeight;
let borderPositionLeft, borderPositionRight, borderPositionTop, borderPositionBottom;
let borderWidth, borderHeight;
let cursorPositionX, cursorPositionY;
let animationId;
let isMouseDown = false;
let x2, x1, y2, y1, deltaX, deltaY;

function blobToImg(blob) {
    return new Promise(resolve => {
        let img = new Image();
        img.onload = () => resolve(img);
        img.src = URL.createObjectURL(blob);
    });
}

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
    ctx.clearRect(0, 0, imgWidth, imgWidth);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, imgWidth, imgHeight);
    ctx.lineWidth = 2;
    ctx.strokeRect(borderPositionLeft, borderPositionTop, borderWidth, borderHeight);
    ctx.clearRect(borderPositionLeft, borderPositionTop, borderWidth, borderHeight);
}

function isLeftButton(e) {
    let button = e.which ? e.which : e.button;
    return button < 2;
}

function cropImg(){
    imgWidth = borderWidth;
    imgHeight = borderHeight;

    let ctx = imgCanvas.getContext("2d");
    let dataUrl = imgCanvas.toDataURL();
    ctx.clearRect(0, 0, imgWidth, imgWidth);

    new Promise(resolve => {
        let newImg = new Image();
        newImg.onload = () => resolve(newImg);
        newImg.src = dataUrl;
    }).then(newImg => {
        imgCanvas.width = canvasImgWidth;
        imgCanvas.height = borderHeight;
        ctx.drawImage(newImg, borderPositionLeft, borderPositionTop, imgWidth, imgHeight, 0, 0, imgWidth, imgHeight);
        borderPositionLeft = borderPositionTop = borderPositionBottom = borderPositionRight = 0;
        drawBorder();
    });

}

function downloadImg(){
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
        blobToImg(fileInput.files[0]).then(img => {
            let ctx = imgCanvas.getContext("2d");
            imgWidth = img.width;
            imgHeight = img.height;

            imgCanvas.height = imgHeight;
            imgCanvas.width = imgWidth;
            ctx.drawImage(img, 0, 0);
            drawBorder( );

            document.querySelector(".btn_download").addEventListener("click", downloadImg);
            document.querySelector(".btn_cut-off").addEventListener("click", cropImg);
        });
    }
});

borderCanvas.addEventListener("mousedown", function (e) {
    x1 = x2 = e.offsetX;
    y1 = y2 = e.offsetY;
    if (isLeftButton(e)) {
        isMouseDown = true;
    }
});
borderCanvas.addEventListener("mousemove", function (e) {
    let scaleK = borderCanvas.width / borderCanvas.offsetWidth;
    cursorPositionX = e.offsetX * scaleK;
    cursorPositionY = e.offsetY * scaleK;
    if (isMouseDown) {
        x2 = e.offsetX;
        y2 = e.offsetY;
        deltaX = x2 - x1;
        deltaY = y2 - y1;
    }
    if (cursorPositionX < borderPositionLeft + 25 && cursorPositionX > borderPositionLeft - 25 && cursorPositionY < borderPositionTop + 25 && cursorPositionY > borderPositionTop - 25) {
        if (isMouseDown) {
            borderPositionLeft = cursorPositionX;
            borderPositionTop = cursorPositionY;
        }
        this.className = "editor-preview__cropper-border editor-preview__cropper-border_active-top-left-bottom-right";
    } else if (cursorPositionX < borderPositionRight + 25 && cursorPositionX > borderPositionRight - 25 && cursorPositionY < borderPositionTop + 25 && cursorPositionY > borderPositionTop - 25) {
        if (isMouseDown) {
            borderPositionRight = cursorPositionX;
            borderPositionTop = cursorPositionY;
        }
        this.className = "editor-preview__cropper-border editor-preview__cropper-border_active-bottom-left-top-right";
    } else if (cursorPositionX < borderPositionRight + 25 && cursorPositionX > borderPositionRight - 25 && cursorPositionY < borderPositionBottom + 25 && cursorPositionY > borderPositionBottom - 25) {
        if (isMouseDown) {
            borderPositionRight = cursorPositionX;
            borderPositionBottom = cursorPositionY;
        }
        this.className = "editor-preview__cropper-border editor-preview__cropper-border_active-top-left-bottom-right";
    } else if (cursorPositionX < borderPositionLeft + 25 && cursorPositionX > borderPositionLeft - 25 && cursorPositionY < borderPositionBottom + 25 && cursorPositionY > borderPositionBottom - 25) {
        if (isMouseDown) {
            borderPositionLeft = cursorPositionX;
            borderPositionBottom = cursorPositionY;
        }
        this.className = "editor-preview__cropper-border editor-preview__cropper-border_active-bottom-left-top-right";
    } else if (cursorPositionX > borderPositionLeft + 25 && cursorPositionX < borderPositionRight - 25 && cursorPositionY > borderPositionTop + 25 && cursorPositionY < borderPositionBottom - 25) {
        if (isMouseDown) {
            borderPositionLeft = borderPositionLeft + deltaX;
            borderPositionTop = borderPositionTop + deltaY;
            borderPositionRight = borderPositionRight + deltaX;
            borderPositionBottom = borderPositionBottom + deltaY;
        }
        this.className = "editor-preview__cropper-border editor-preview__cropper-border_active-move";
    } else if (cursorPositionX < borderPositionLeft + 25 && cursorPositionX > borderPositionLeft - 25 && cursorPositionY > borderPositionTop + 25 && cursorPositionY < borderPositionBottom - 25) {
        if (isMouseDown) {
            borderPositionLeft = cursorPositionX;
        }
        this.className = "editor-preview__cropper-border editor-preview__cropper-border_active-x";
    } else if (cursorPositionX < borderPositionRight + 25 && cursorPositionX > borderPositionRight - 25 && cursorPositionY > borderPositionTop + 25 && cursorPositionY < borderPositionBottom - 25) {
        if (isMouseDown) {
            borderPositionRight = cursorPositionX;
        }
        this.className = "editor-preview__cropper-border editor-preview__cropper-border_active-x";
    } else if (cursorPositionY < borderPositionTop + 25 && cursorPositionY > borderPositionTop - 25 && cursorPositionX > borderPositionLeft + 25 && cursorPositionX < borderPositionRight - 25) {
        if (isMouseDown) {
            borderPositionTop = cursorPositionY;
        }
        this.className = "editor-preview__cropper-border editor-preview__cropper-border_active-y";
    } else if (cursorPositionY < borderPositionBottom + 25 && cursorPositionY > borderPositionBottom - 25 && cursorPositionX > borderPositionLeft + 25 && cursorPositionX < borderPositionRight - 25) {
        if (isMouseDown) {
            borderPositionBottom = cursorPositionY;
        }
        this.className = "editor-preview__cropper-border editor-preview__cropper-border_active-y";
    } else {
        this.className = "editor-preview__cropper-border";
    }

    if (isMouseDown) {
        animationId = window.requestAnimationFrame(drawBorder);
        x1 = x2;
        y1 = y2;
    }
});


borderCanvas.addEventListener("mouseup", function (e) {
    this.className = "editor-preview__cropper-border";
    if (isLeftButton(e)) {
        isMouseDown = false;
    }
    window.cancelAnimationFrame(animationId);
});


