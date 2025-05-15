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
  
    // If user already has today’s number, check if it’s still valid
    if (stored && stored.date === today) {
      const snap = await ref.once('value');
      const data = snap.val() || { date: today, count: 0 };
  
      // If current queue count is still below the user’s number, re‑use it
      if (data.count < stored.number) {
        display(stored.number, today);
        return;
      }
      // Otherwise, their slot has passed—fall through to assign a new number
    }
  
    // Fetch fresh data and reset at 2 AM if needed
    const snap = await ref.once('value');
    let { date, count } = snap.val() || { date: today, count: 0 };
    const now = new Date();
    if (date !== today && now.getHours() >= 2) {
      date = today;
      count = 0;
    }
  
    // Issue the next number
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
            document.getElementById('remaining').textContent = `Люди впереди(Алдыда адам бар): ${remaining >= 0 ? remaining : 0}`;
        }
    });

    function updateRemaining(count, userNumber) {
        let remaining;
        if (count < userNumber) {
            remaining = userNumber - count;
        } else if (count === userNumber) {
            remaining = 0;
        } else {
            remaining = 0;
        }
        const el = document.getElementById('remaining');
        if (remaining === 0) {
            el.textContent = (count === userNumber) ? "Ваша очередь!" : "Люди впереди(Алдыда адам бар): 0";
        } else {
            el.textContent = `Люди впереди(Алдыда адам бар): ${remaining}`;
        }
    }

    // Attach refresh button
    // document.getElementById('refreshBtn').addEventListener('click', updateRemaining);
});
