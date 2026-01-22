const firebaseConfig = {
  apiKey: "AIzaSyANOTCPM7fLio_hmgUGvm4KddT8DvrInC8",
  authDomain: "teamplay-online.firebaseapp.com",
  projectId: "teamplay-online",
  storageBucket: "teamplay-online.firebasestorage.app",
  messagingSenderId: "990215736535",
  appId: "1:990215736535:web:6ea46ef57f0df1de9ff492"
};

// Инициализация
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Отображение списка
db.collection("computers").orderBy("number").onSnapshot((snapshot) => {
    const list = document.getElementById('pc-list');
    list.innerHTML = '';
    snapshot.forEach((doc) => {
        const pc = doc.data();
        const card = document.createElement('div');
        card.className = `pc-card ${pc.status}`;
        card.innerHTML = `
            <h2>ПК №${pc.number}</h2>
            <p>Статус: ${pc.status === 'free' ? 'Свободен' : 'Занят до ' + pc.bookedUntil}</p>
            <button onclick="bookPC('${doc.id}')" ${pc.status === 'busy' ? 'disabled' : ''}>
                ${pc.status === 'free' ? 'Забронировать' : 'Занят'}
            </button>
            ${pc.status === 'busy' ? `<br><br><button style="background:#e74c3c" onclick="releasePC('${doc.id}')">Освободить</button>` : ''}
        `;
        list.appendChild(card);
    });
});

function bookPC(id) {
    const time = prompt("До скольки бронируем? (например, 20:00)");
    if (time) {
        db.collection("computers").doc(id).update({
            status: 'busy',
            bookedUntil: time
        });
    }
}

function releasePC(id) {
    db.collection("computers").doc(id).update({
        status: 'free',
        bookedUntil: '-'
    });
}
