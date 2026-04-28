const firebaseConfig = {
  apiKey: "AIzaSyD-GIZG0VLEtWiHVJ1s-XxufUCbrdNrkuo",
  authDomain: "martina-6170e.firebaseapp.com",
  projectId: "martina-6170e",
  storageBucket: "martina-6170e.firebasestorage.app",
  messagingSenderId: "424242445464",
  appId: "1:424242445464:web:28dfd5251dd00520b024ed"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const DOC_REF = db.collection("appdata").doc("martina_shared");

function saveData(data) {
  DOC_REF.set(data).catch(e => console.error("Firebase save error:", e));
}

function subscribeData(callback) {
  return DOC_REF.onSnapshot(snap => {
    if (snap.exists) callback(snap.data());
  }, err => console.error("Firebase subscribe error:", err));
}
