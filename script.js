document.addEventListener("DOMContentLoaded", async function () {
    const video = document.getElementById("preview");
    const startScanBtn = document.getElementById("start-scan");
    const qrResult = document.getElementById("qr-result");
    const qrHistoryList = document.getElementById("qr-history");
    const overlay = document.getElementById("qr-overlay");

    //Offline Warning Message
    const offlineMessage = document.createElement("div");
    offlineMessage.id = "offline-message";
    offlineMessage.innerText = "⚠️ You are offline. Some features may not work.";
    offlineMessage.style.cssText = "position: fixed; top: 0; width: 100%; background: red; color: white; padding: 10px; text-align: center; display: none;";
    document.body.appendChild(offlineMessage);

    //Detect Offline Mode
    window.addEventListener("offline", () => {
        offlineMessage.style.display = "block";
    });

    window.addEventListener("online", () => {
        offlineMessage.style.display = "none";
    });

    //Ensure QrScanner is loaded
    if (typeof QrScanner === "undefined") {
        console.error("QrScanner failed to load! Make sure 'qr-scanner.min.js' is included.");
        return;
    }

    console.log("✅ QrScanner loaded successfully:", QrScanner);

    let scanner = new QrScanner(video, async result => {
        qrResult.innerText = "✅ QR Code: " + result;
        await saveQRCode(result); //QR kodu IndexedDB'ye kaydet
        scanner.stop();
        overlay.style.display = "none";

        //Send scanned QR code to API (optional)
        try {
            const response = await fetch("https://your-api.com/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ qrCode: result })
            });

            if (response.ok) {
                console.log("✅ QR Code sent to API successfully!");
            } else {
                console.error("❌ Failed to send QR Code to API.");
            }
        } catch (error) {
            console.error("❌ API request error:", error);
        }
    });

    startScanBtn.addEventListener("click", async () => {
        video.style.display = "block";
        overlay.style.display = "block";

        try {
            await scanner.start();
        } catch (error) {
            console.error("❌ Camera error:", error);
            alert("Failed to access the camera. Please allow camera permissions.");
        }
    });

    //IndexedDB: Save QR Code
    async function saveQRCode(qrText) {
        if (!window.indexedDB) {
            console.error("❌ IndexedDB is not supported in this browser.");
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
            console.error("❌ Error opening IndexedDB.");
        };
    }

    function loadHistory() {
        qrHistoryList.innerHTML = "";
        let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
        history.forEach(item => {
            let li = document.createElement("li");
            li.textContent = item;
            qrHistoryList.appendChild(li);
        });
    }

    loadHistory();

    //Register Service Worker
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/service-worker.js")
        .then(() => console.log("✅ Service Worker registered successfully"))
        .catch((error) => console.log("❌ Error registering Service Worker:", error));
    }

    //Request Push Notification Permission
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("✅ Push notifications are enabled.");
            } else {
                console.warn("❌ Push notifications are disabled.");
            }
        });
    }
});
