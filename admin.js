// TODO: Replace with your Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyCjxNPm7xFPFz9QgCZzldttZFO_e-IU7ag",
    authDomain: "queue-dentist.firebaseapp.com",
    projectId: "queue-dentist",
    storageBucket: "queue-dentist.firebasestorage.app",
    messagingSenderId: "1052131490667",
    appId: "1:1052131490667:web:f5515886b538382e0b2a2e"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const ref = db.ref('queue');
  
  function getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }
  
  // Load current
  ref.on('value', snap => {
    const data = snap.val() || { date: getTodayDate(), count: 0 };
    document.getElementById('currentDate').textContent = data.date;
    document.getElementById('currentNumber').textContent = data.count;
  });
  
  document.getElementById('updateBtn').addEventListener('click', () => {
    const next = parseInt(document.getElementById('nextNumber').value, 10);
    if (!isNaN(next)) {
      ref.set({ date: getTodayDate(), count: next });
      document.getElementById('nextNumber').value = '';
    }
  });