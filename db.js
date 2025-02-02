//Open IndexedDB
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("QRCodeDB", 1);

        request.onupgradeneeded = function (event) {
            let db = event.target.result;
            if (!db.objectStoreNames.contains("qrcodes")) {
                db.createObjectStore("qrcodes", { autoIncrement: true });
            }
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject("IndexedDB error: " + event.target.errorCode);
        };
    });
}

//Save QR Code to IndexedDB
async function saveQRCode(qrText) {
    const db = await openDatabase();
    const transaction = db.transaction("qrcodes", "readwrite");
    const store = transaction.objectStore("qrcodes");
    store.add({ qrCode: qrText, date: new Date() });
}

//Get all QR Codes from IndexedDB
async function getQRCodes() {
    return new Promise(async (resolve, reject) => {
        const db = await openDatabase();
        const transaction = db.transaction("qrcodes", "readonly");
        const store = transaction.objectStore("qrcodes");
        const request = store.getAll();

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject("Error retrieving QR codes.");
        };
    });
}

//Clear all QR Codes from IndexedDB
async function clearQRCodes() {
    const db = await openDatabase();
    const transaction = db.transaction("qrcodes", "readwrite");
    const store = transaction.objectStore("qrcodes");
    store.clear();
}
