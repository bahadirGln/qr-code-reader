import QrScanner from "./qr-scanner.min.js";

document.addEventListener("DOMContentLoaded", async function () {
    const video = document.getElementById("preview");
    const qrResult = document.getElementById("qr-result");
    const overlay = document.getElementById("qr-overlay");

    //Kamera erişimini kontrol et
    try {
        await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (error) {
        showError("❌ Camera access denied. Please enable camera permissions.");
        return;
    }

    //QR Scanner'ın yüklü olup olmadığını kontrol et
    if (typeof QrScanner === "undefined") {
        showError("❌ QR Scanner failed to load! Please refresh the page.");
        return;
    }

    let scanner = new QrScanner(video, async result => {
        qrResult.innerText = "✅ QR Code: " + result;

        //QR kodu IndexedDB'ye kaydet
        await saveQRCode(result);

        //URL mi kontrol et ve aç
        if (isValidURL(result)) {
            setTimeout(() => {
                window.open(result, "_blank"); // Yeni sekmede aç
            }, 1000);
        }

        scanner.stop();
        overlay.style.display = "none";
    });

    try {
        await scanner.start();
        overlay.style.display = "block";
    } catch (error) {
        showError("❌ Failed to access the camera. Please allow camera permissions.");
    }

    //Çevrimdışı uyarısı
    window.addEventListener("offline", () => {
        showError("⚠ You are offline. Scanned QR codes will be saved locally.");
    });

    function showError(message) {
        let errorDiv = document.createElement("div");
        errorDiv.style.color = "red";
        errorDiv.style.fontWeight = "bold";
        errorDiv.style.marginTop = "10px";
        errorDiv.innerText = message;
        document.body.appendChild(errorDiv);
    }

    //URL Kontrol Fonksiyonu
    function isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    //IndexedDB: QR Kodunu Kaydet
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
