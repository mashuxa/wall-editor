// (function () {
    "use strict";

    let fileInput = document.getElementById("fileImage");

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
                let {width, height} = img;
                let canvas = document.getElementById("currentImg");
                let ctx = canvas.getContext("2d");
                canvas.height = height;
                canvas.width = width;
                ctx.drawImage(img, 0, 0);
                cropImg();
                document.querySelector(".btn_download").addEventListener("click", () => {
                    canvas.toBlob(blob => {
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

    function cropImg(x0, y0, borderWidth, borderHeight) {
        let canvas = document.getElementById("currentImg");
        let ctx = canvas.getContext("2d");
        let {width, height} = canvas;
        x0 = x0 || width/4;
        y0 = y0 || height/4;
        borderWidth = borderWidth || width/2;
        borderHeight = borderHeight || height/2;
        ctx.save();
        // console.log(width, height);

        // заливаем черным
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, width, height);
        // вырезаем рамку
        ctx.clearRect(x0, y0, borderWidth, borderHeight);

        // ctxMask.fillRect(0, 0, width, height);
        // ctxMask.fillStyle = "rgba(0,0,0,0.5)";
        // ctxMask.clearRect(50, 50, width - 100, height - 100);
        // canvasWrapper.appendChild(canvasMask);
    }


// }());