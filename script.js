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
    const stored = JSON.parse(localStorage.getItem('myQueue'));
    
    // 1) Try to reuse today’s number:
    if (stored) {
      // if it’s still ahead of “count”, just show it
      const snap = await ref.once('value');
      const { count = 0, numbers = {} } = snap.val() || {};
      if (stored.number > count) {
        display(stored.number, stored.phone);
        return;
      }
      // otherwise fall-through to get a fresh one
    }
  
    // 2) Fetch current snapshot, pull existing map
    const snap = await ref.once('value');
    const data = snap.val() || { count: 0, numbers: {} };
  
    // next queue number is map size + 1
    const next = Object.keys(data.numbers).length + 1;
    const phone = document.getElementById('userPhone').value.trim();
    if (!phone) {
      alert('Пожалуйста, введите номер телефона');
      return;
    }
  
    // 3) Write back: preserve .count, update the map
    const updatedMap = { ...data.numbers, [next]: phone };
    await ref.update({ numbers: updatedMap });
  
    // 4) Save locally and show
    localStorage.setItem('myQueue', JSON.stringify({ number: next, phone }));
    display(next, phone);
  }

function display(num, phone) {
    document.getElementById('number').textContent = num;
    document.getElementById('phone').textContent = phone;
}

// Attach event to button
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('getQueueBtn').addEventListener('click', assignNumber);
    // Update remaining count whenever queue changes
    ref.on('value', snap => {
        const data = snap.val() || { count: 0, numbers: {} };
        const stored = JSON.parse(localStorage.getItem('myQueue'));
        if (stored && data.count != null) {
          // if the serving number has passed theirs, clear out
          if (data.count >= stored.number) {
            localStorage.removeItem('myQueue');
            assignNumber(); 
          } else {
            const remaining = stored.number - data.count;
            document.getElementById('remaining').textContent =
              `Люди впереди(Алдыда адам бар): ${remaining}`;
          }
        }
      });
});
