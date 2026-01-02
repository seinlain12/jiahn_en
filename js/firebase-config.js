const firebaseConfig = {
    apiKey: "AIzaSyDFsKzHtjw9Hc-tPQGs4gnDpqq6VzmpZ3I",
    authDomain: "tjdgns-2e002.firebaseapp.com",
    databaseURL: "https://tjdgns-2e002-default-rtdb.firebaseio.com",
    projectId: "tjdgns-2e002",
    storageBucket: "tjdgns-2e002.firebasestorage.app",
    messagingSenderId: "406888986104",
    appId: "1:406888986104:web:a1d65601324971c3c0d20d",
    measurementId: "G-DB42KPYH0B"
};

// Firebase 초기화
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
