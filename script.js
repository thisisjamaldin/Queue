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

async function assignNumber() {
  const stored = JSON.parse(localStorage.getItem('myQueue')) || {};

  // If they already have a ticket ahead of current count, just show it:
  const snap0 = await ref.once('value');
  const { count = 0, numbers = {}, total = 0 } = snap0.val() || {};
  if (stored.number > count) {
    render(stored.number, stored.phone, count);
    return;
  }

  // Otherwise issue a fresh ticket:
  const next = total + 1;
  const phone = document.getElementById('userPhone').value.trim();
  if (!phone) return alert('Пожалуйста, введите номер телефона');

  // update DB: bump numbers map, bump total (but leave count untouched)
  const updatedMap = { ...numbers, [next]: phone };
  const today = new Date().toISOString().slice(0,10);
  await ref.update({
    numbers: updatedMap,
    total: next,
    date: today
  });

  localStorage.setItem('myQueue', JSON.stringify({ number: next, phone }));
  render(next, phone, count);
}

function render(myNumber, phone, count) {
  document.getElementById('number').textContent    = myNumber;
  document.getElementById('phone').textContent     = phone;
  document.getElementById('remaining').textContent = 
      `Люди впереди(Алдыда адам бар)2: ${Math.max(0, myNumber - count)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('getQueueBtn').addEventListener('click', assignNumber);
  ref.on('value', snap => {
    const { count = 0, total = 0 } = snap.val() || {};
    const stored = JSON.parse(localStorage.getItem('myQueue')) || {};
    if (stored.number > count) {
      render(stored.number, stored.phone, count);
    } else if (stored.number) {
      // they’ve now been served, clear and re-assign
      localStorage.removeItem('myQueue');
      document.getElementById('remaining').textContent = 'Ваша очередь прошла.';
    }
  });
});