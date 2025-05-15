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

function getTodayDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

async function assignNumber() {
  const stored = JSON.parse(localStorage.getItem('myQueue'));
  const today = getTodayDate();
  if (stored && stored.date === today) {
    display(stored.number, today);
    return;
  }

  const snap = await ref.once('value');
  let { date, count } = snap.val() || { date: today, count: 0 };

  // Reset at or after 2 AM
  const now = new Date();
  const hour = now.getHours();
  if (date !== today && hour >= 2) {
    date = today;
    count = 0;
  }

  count++;
  await ref.set({ date, count });

  localStorage.setItem('myQueue', JSON.stringify({ date, number: count }));
  display(count, date);
}

function display(num, date) {
  document.getElementById('number').textContent = num;
  document.getElementById('date').textContent = date;
}

// Attach event to button
 document.addEventListener('DOMContentLoaded', () => {
   document.getElementById('getQueueBtn').addEventListener('click', assignNumber);
   // Update remaining count whenever queue changes
   ref.on('value', snap => {
     const data = snap.val();
     const stored = JSON.parse(localStorage.getItem('myQueue'));
     if (stored && data && typeof data.count === 'number') {
       const remaining = data.count - stored.number;
       document.getElementById('remaining').textContent = `People ahead: ${remaining >= 0 ? remaining : 0}`;
     }
   });
});
