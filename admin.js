// TODO: Replace with your Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyCjxNPm7xFPFz9QgCZzldttZFO_e-IU7ag",
    authDomain: "queue-dentist.firebaseapp.com",
    projectId: "queue-dentist",
    databaseURL: "https://queue-dentist-default-rtdb.europe-west1.firebasedatabase.app",
    storageBucket: "queue-dentist.firebasestorage.app",
    messagingSenderId: "1052131490667",
    appId: "1:1052131490667:web:f5515886b538382e0b2a2e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const ref = db.ref('queue');

ref.on('value', snap => {
    const data = snap.val() || { count: 0, numbers: {} };
    const phone = data.numbers?.[data.count] ?? '--';
    const telLink = document.querySelector('a[href^="tel:"]');
    if (telLink) {
        telLink.href = phone !== '--' ? `tel:${phone}` : '#';
    }
    document.getElementById('phone').textContent = phone;
    document.getElementById('currentNumber').textContent = data.count;
});

document.getElementById('updateBtn').addEventListener('click', async () => {
    const nextCount = parseInt(document.getElementById('nextNumber').value, 10);
    if (isNaN(nextCount)) return alert('Введите число');

    // update only the count field
    await ref.update({ count: nextCount });
    document.getElementById('nextNumber').value = '';
});