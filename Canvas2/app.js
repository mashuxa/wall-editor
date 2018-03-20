(function () {

    'use strict';

    let frameRequest,
        removeListeners;

    let previewCanvas = document.getElementById('preview');
    let fileInput = document.getElementById('file');
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) {
            cancelAnimationFrame(frameRequest);
            if (typeof removeListeners === 'function') {
                removeListeners();
            }
            blobToImg(fileInput.files[0]).then(img => {
                let {width, height} = img,
                    overlayCanvas = document.createElement('canvas');
                fitCanvas(previewCanvas, width, height);
                fitCanvas(overlayCanvas, width, height);
                let overlayContext = overlayCanvas.getContext('2d'),
                    previewContext = previewCanvas.getContext('2d'),
                    renderOverlay = getRenderOverlay(overlayContext, width, height),
                    position = {
                        x: width / 2,
                        y: height / 2,
                        r: Math.min(width, height) / 2
                    };
                removeListeners = bindListeners(previewCanvas, position);
                animate(() => {
                    renderOverlay(position.x, position.y, position.r);
                    makePreview(previewContext, img, overlayCanvas);
                });

            });
        }
    });

    function bindListeners(preview, position) {
        let mode = null,
            diff = 10,
            mousedown = e => {
                if (e.offsetX >= position.x - position.r - diff && e.offsetX <= position.x - position.r + diff ||
                    e.offsetX >= position.x + position.r - diff && e.offsetX <= position.x + position.r + diff
                    && e.offsetY <= position.y - diff && e.offsetY >= position.y + diff) {
                    mode = 'resize';
                } else {
                    mode = 'move';
                }
            },
            mousemove = e => {
                if (mode === 'resize') {
                    position.r = Math.abs(position.r - e.movementX);
                }
                if (mode === 'move') {
                    position.x = e.offsetX;
                    position.y = e.offsetY;
                }
            },
            mouseup = e => {
                mode = null;
            };
        preview.addEventListener('mousedown', mousedown);
        preview.addEventListener('mousemove', mousemove);
        preview.addEventListener('mouseup', mouseup);
        return () => {
            preview.removeEventListener('mousedown', mousedown);
            preview.removeEventListener('mousemove', mousemove);
            preview.removeEventListener('mouseup', mouseup);
        };
    }

    function animate(fn) {
        frameRequest = requestAnimationFrame(() => {
            fn();
            animate(fn);
        });
    }

    function blobToImg(blob) {
        return new Promise(resolve => {
            let img = new Image();
            img.onload = () => resolve(img);
            img.src = URL.createObjectURL(blob);
        });
    }

    function fitCanvas(canvas, width, height) {
        canvas.width = width;
        canvas.height = height;
    }

    function getRenderOverlay(ctx, width, heigth) {
        return (x, y, r) => {
            ctx.save();
            ctx.clearRect(0, 0, width, heigth);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, width, heigth);
            ctx.fillStyle = '#fff';
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };

    }

    function makePreview(ctx, image, overlay) {
        ctx.drawImage(image, 0, 0, image.width, image.height);
        ctx.drawImage(overlay, 0, 0, image.width, image.height);
    }


    // console.log(ctx.getImageData(0, 0, canvas.width, canvas.height));

}());

