const firebaseConfig = {
  // Ваш конфиг остается тем же
  apiKey: "AIzaSyANOTCPM7fLio_hmgUGvm4KddT8DvrInC8",
  authDomain: "teamplay-online.firebaseapp.com",
  projectId: "teamplay-online",
  storageBucket: "teamplay-online.firebasestorage.app",
  messagingSenderId: "990215736535",
  appId: "1:990215736535:web:6ea46ef57f0df1de9ff492"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Вставьте сюда ваш Email (как в Firebase Auth), чтобы система узнала в вас админа
const ADMIN_EMAIL = "netvoiyrovendorogoy@gmail.com"; 

let currentUser = null;

// Следим за входом пользователя
auth.onAuthStateChanged((user) => {
    currentUser = user;
    renderUI();
});

function login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
}

function logout() {
    auth.signOut();
}

function renderUI() {
    const list = document.getElementById('pc-list');
    if (!currentUser) {
        list.innerHTML = `<button onclick="login()">Войти через Google, чтобы бронировать</button>`;
        return;
    }

    db.collection("computers").orderBy("number").onSnapshot((snapshot) => {
        list.innerHTML = `<p>Вы вошли как: ${currentUser.displayName} <button onclick="logout()">Выйти</button></p>`;
        snapshot.forEach((doc) => {
            const pc = doc.data();
            const isAdmin = currentUser.email === ADMIN_EMAIL;
            const isOwner = pc.userId === currentUser.uid;

            const card = document.createElement('div');
            card.className = `pc-card ${pc.status}`;
            card.innerHTML = `
                <h2>ПК №${pc.number}</h2>
                <p>Статус: ${pc.status === 'free' ? '✅ Свободен' : '❌ Занят: ' + pc.userName + ' до ' + pc.bookedUntil}</p>
                
                ${pc.status === 'free' 
                    ? `<button onclick="bookPC('${doc.id}')">Забронировать</button>` 
                    : (isAdmin || isOwner) 
                        ? `<button style="background:#e74c3c" onclick="releasePC('${doc.id}')">Освободить</button>`
                        : `<p><small>Только владелец или админ могут снять бронь</small></p>`
                }
            `;
            list.appendChild(card);
        });
    });
}

function bookPC(id) {
    const time = prompt("До скольки бронируем? (например, 20:00)");
    if (time && currentUser) {
        db.collection("computers").doc(id).update({
            status: 'busy',
            bookedUntil: time,
            userId: currentUser.uid,       // ID пользователя
            userName: currentUser.displayName // Имя для отображения
        });
    }
}

function releasePC(id) {
    db.collection("computers").doc(id).update({
        status: 'free',
        bookedUntil: '-',
        userId: null,
        userName: null
    });
}
