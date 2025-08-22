// Firebase bootstrap using your provided config (compat SDK)
(function(){
  const firebaseConfig = {
    apiKey: "AIzaSyDWkhmOClcLO3Ln7Za6zwt6d2nrO24spq4",
    authDomain: "myblog-61329.firebaseapp.com",
    projectId: "myblog-61329",
    storageBucket: "myblog-61329.appspot.com", // corrected to appspot.com
    messagingSenderId: "59428518621",
    appId: "1:59428518621:web:7b11c58a518233b248b934",
    measurementId: "G-EVV8SE32BQ"
  };
  firebase.initializeApp(firebaseConfig);
  window.FB = {
    auth: firebase.auth(),
    db: firebase.firestore(),
    storage: firebase.storage(),
    provider: new firebase.auth.GoogleAuthProvider(),
    ts: firebase.firestore.FieldValue.serverTimestamp
  };
})();