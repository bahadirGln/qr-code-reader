document.addEventListener("DOMContentLoaded", async function () {
    const qrHistoryList = document.getElementById("qr-history");
    const clearHistoryBtn = document.getElementById("clear-history");

    async function loadHistory() {
        qrHistoryList.innerHTML = "";
        let history = await getQRCodes(); //Fetch from IndexedDB

        if (history.length === 0) {
            qrHistoryList.innerHTML = "<li>No QR codes scanned yet.</li>";
        } else {
            history.forEach(item => {
                let li = document.createElement("li");
                li.textContent = `${item.text} (Scanned on: ${new Date(item.date).toLocaleString()})`;
                qrHistoryList.appendChild(li);
            });
        }
    }

    clearHistoryBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to clear the scan history?")) {
            await clearQRCodes(); //Clear IndexedDB
            loadHistory();
        }
    });

    loadHistory();
});

//Fetch QR codes from IndexedDB
async function getQRCodes() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("QRCodeDB", 1);

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["qrCodes"], "readonly");
            const store = transaction.objectStore("qrCodes");
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = function () {
                resolve(getAllRequest.result);
            };

            getAllRequest.onerror = function () {
                reject("Error retrieving QR codes from IndexedDB.");
            };
        };

        request.onerror = function () {
            reject("Failed to open IndexedDB.");
        };
    });
}

//Clear QR codes from IndexedDB
async function clearQRCodes() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("QRCodeDB", 1);

        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(["qrCodes"], "readwrite");
            const store = transaction.objectStore("qrCodes");
            const clearRequest = store.clear();

            clearRequest.onsuccess = function () {
                resolve("Scan history cleared.");
            };

            clearRequest.onerror = function () {
                reject("Error clearing QR history.");
            };
        };

        request.onerror = function () {
            reject("Failed to open IndexedDB.");
        };
    });
}
