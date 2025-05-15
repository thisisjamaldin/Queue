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

// listen & render
ref.on('value', snap => {
  const data = snap.val() || { count: 0, numbers: {}, total: 0 };
  const { count, numbers } = data;
  const phone = numbers[count] || '--';
  // render the tel link & fields
  const telLink = document.querySelector('a[href^="tel:"]');
  if (telLink) telLink.href = phone !== '--' ? `tel:${phone}` : '#';
  document.getElementById('phone').textContent = phone;
  document.getElementById('currentNumber').textContent = count;
});

// bump count & prune old
document.getElementById('updateBtn').addEventListener('click', async () => {
  const nextCount = parseInt(document.getElementById('nextNumber').value, 10);
  if (isNaN(nextCount)) return alert('Введите число');

  // 1) Update count
  await ref.update({ count: nextCount });

  // 2) Prune any tickets ≤ nextCount
  const snap = await ref.once('value');
  const data = snap.val() || { numbers: {} };
  const numbers = data.numbers || {};
  const pruned = {};
  Object.entries(numbers).forEach(([num, phone]) => {
    if (Number(num) > nextCount) pruned[num] = phone;
  });
  // write back only the unserved tickets
  await ref.update({ numbers: pruned });

  document.getElementById('nextNumber').value = '';
});