document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("preview");
    const startScanBtn = document.getElementById("start-scan");
    const qrResult = document.getElementById("qr-result");
    const qrHistoryList = document.getElementById("qr-history");

    let scanner = new QrScanner(video, result => {
        qrResult.innerText = "QR Kodu: " + result;
        saveToHistory(result);
        scanner.stop(); // QR kod okunduktan sonra kamerayı kapat
    });

    startScanBtn.addEventListener("click", () => {
        video.style.display = "block";
        scanner.start();
    });

    function saveToHistory(qrText) {
        let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
        history.push(qrText);
        localStorage.setItem("qrHistory", JSON.stringify(history));
        loadHistory();
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
});
