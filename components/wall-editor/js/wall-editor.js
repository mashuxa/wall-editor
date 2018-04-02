(function () {

// Запрос всех файлов из галереи
    openDB(DB_NAME, DB_VERSION, STORE_NAME).then(db => {


        new Promise(resolve => {
            let transaction = db.transaction([STORE_NAME], "readonly");
            let objectStore = transaction.objectStore(STORE_NAME);
            let request = objectStore.getAll();

            request.onsuccess = () => {
                resolve(request);
            };


        }).then(request => {
            console.log(request.result);
        });


    });


}());
