let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });

scanner.addListener('scan', function (content) {
    document.getElementById('qr-result').innerText = "QR Kodu: " + content;
    alert("QR Kodu Okundu: " + content);
});

Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
        scanner.start(cameras[0]);  // İlk bulunan kamerayı kullan
    } else {
        alert("Kamera bulunamadı.");
    }
}).catch(function (e) {
    console.error(e);
});
