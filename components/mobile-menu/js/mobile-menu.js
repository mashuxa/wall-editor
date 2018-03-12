function initializeMobileMenu() {
    document.body.addEventListener("mouseup", function (e) {
        if (
            !e.target.classList.contains("js-mobile-menu") && 
            !e.target.classList.contains("js-mobile-menu-toggle") && 
            !e.target.parentElement.classList.contains("js-mobile-menu") && 
            !e.target.parentElement.classList.contains("js-mobile-menu-toggle")
        ) {
            closeMobileMenu();
        }
    });
    document.querySelector(".js-mobile-menu").addEventListener("touchstart", function (e) {
        touchstartX = e.changedTouches[0].screenX;
    });
    document.querySelector(".js-mobile-menu").addEventListener("touchend", function (e) {
        touchendX = e.changedTouches[0].screenX;
        if (touchstartX > touchendX && Math.abs(touchstartX - touchendX) > 50) {
            closeMobileMenu();
        }
    });

    function closeMobileMenu() {
        document.getElementById("js-mobile-menu-toggle").checked = false;
    }
}
