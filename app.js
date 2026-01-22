const firebaseConfig = {
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

// Укажите ваш email из Firebase Auth, чтобы получить права админа
const ADMIN_EMAIL = "ВАШ_EMAIL@GMAIL.COM"; 

auth.onAuthStateChanged((user) => {
    const infoDiv = document.getElementById('user-info');
    if (user) {
        infoDiv.innerHTML = `<p>Привет, ${user.displayName || 'Пользователь'}! <button onclick="auth.signOut()" style="width:auto; padding:5px 10px; font-size:12px;">Выйти</button></p>`;
        loadPCs(user);
    } else {
        infoDiv.innerHTML = `<button onclick="login()">Войти через Google для бронирования</button>`;
        document.getElementById('pc-list').innerHTML = "<p>Войдите в аккаунт, чтобы увидеть список ПК</p>";
    }
});

function login() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => alert("Ошибка входа: " + err.message));
}

function loadPCs(user) {
    db.collection("computers").orderBy("number").onSnapshot((snapshot) => {
        const list = document.getElementById('pc-list');
        list.innerHTML = '';
        snapshot.forEach((doc) => {
            const pc = doc.data();
            const isAdmin = user.email === ADMIN_EMAIL;
            const isOwner = pc.userId === user.uid;

            const card = document.createElement('div');
            card.className = `pc-card ${pc.status}`;
            card.innerHTML = `
                <h2>ПК №${pc.number}</h2>
                <p>Статус: ${pc.status === 'free' ? '✅ Свободен' : '❌ Занят: ' + (pc.userName || 'Кем-то')}</p>
                <p>${pc.status === 'busy' ? 'До: ' + pc.bookedUntil : ''}</p>
                
                ${pc.status === 'free' 
                    ? `<button onclick="bookPC('${doc.id}', '${user.displayName}', '${user.uid}')">Забронировать</button>` 
                    : (isAdmin || isOwner) 
                        ? `<button style="background:#e74c3c" onclick="releasePC('${doc.id}')">Освободить</button>`
                        : `<p><small>Бронь другого игрока</small></p>`
                }
            `;
            list.appendChild(card);
        });
    });
}

function bookPC(id, name, uid) {
    const time = prompt("Напишите время (например, до 21:00):");
    if (time) {
        db.collection("computers").doc(id).update({
            status: 'busy',
            bookedUntil: time,
            userId: uid,
            userName: name
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
