(function(){
    "use strict";

    let transaction = db.transaction([STORE_NAME], "readonly");
    let objectStore = transaction.objectStore(STORE_NAME);
//
let allImgs = objectStore.getAll();
//
console.log(allImgs);











}());