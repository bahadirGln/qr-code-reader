document.addEventListener("DOMContentLoaded", async function () {
    const video = document.getElementById("preview");
    const qrResult = document.getElementById("qr-result");
    const overlay = document.getElementById("qr-overlay");

    if (typeof QrScanner === "undefined") {
        showError("QR Scanner failed to load! Please refresh the page.");
        return;
    }

    let scanner = new QrScanner(video, async result => {
        qrResult.innerText = "QR Code: " + result;
        await saveQRCode(result); //Save to IndexedDB instead of localStorage
        scanner.stop();
        overlay.style.display = "none";
    });

    try {
        await scanner.start();
        overlay.style.display = "block";
    } catch (error) {
        showError("Failed to access the camera. Please allow camera permissions.");
    }

    function showError(message) {
        let errorDiv = document.createElement("div");
        errorDiv.style.color = "red";
        errorDiv.style.fontWeight = "bold";
        errorDiv.style.marginTop = "10px";
        errorDiv.innerText = message;
        document.body.appendChild(errorDiv);
    }

    //IndexedDB: Save QR Code
    async function saveQRCode(qrText) {
        if (!window.indexedDB) {
            console.error("IndexedDB is not supported in this browser.");
            return;
        }

        const request = indexedDB.open("QRCodeDB", 1);

        request.onupgradeneeded = function (event) {
            let db = event.target.result;
            if (!db.objectStoreNames.contains("qrCodes")) {
                db.createObjectStore("qrCodes", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = function (event) {
            let db = event.target.result;
            let transaction = db.transaction(["qrCodes"], "readwrite");
            let store = transaction.objectStore("qrCodes");

            let qrEntry = {
                text: qrText,
                date: new Date().toLocaleString()
            };

            store.add(qrEntry);
        };

        request.onerror = function () {
            console.error("Error opening IndexedDB.");
        };
    }
});
