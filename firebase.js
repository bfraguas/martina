// Firebase SDK via CDN - loaded in index.html before this file
// This file provides saveData() and subscribeData() functions

const firebaseConfig = {
  apiKey: "AIzaSyDjuMokvyVNhezvbe__4qOHtbO0vsrPULU",
  authDomain: "martina-6aa4e.firebaseapp.com",
  projectId: "martina-6aa4e",
  storageBucket: "martina-6aa4e.firebasestorage.app",
  messagingSenderId: "387522578281",
  appId: "1:387522578281:web:8f890ad4f60ce1d4e35ff8"
};

// Initialize Firebase
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
