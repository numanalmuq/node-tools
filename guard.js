// guard.js — Node Tools access guard.
// Taruh <script src="../guard.js"></script> PALING ATAS <head>, sebelum tag/skrip lain, di SETIAP file tools/*.html.
// Cek: udah login Google + masih punya akses aktif (Firestore). Kalau enggak, halaman disembunyikan lalu dilempar balik ke index.html.
(function () {
  'use strict';
  document.documentElement.style.visibility = 'hidden';

  // GANTI dengan config Firebase project kamu — HARUS SAMA PERSIS dengan yang di index.html
  var firebaseConfig = {
    apiKey: "GANTI_DENGAN_API_KEY",
    authDomain: "GANTI.firebaseapp.com",
    projectId: "GANTI_PROJECT_ID",
    storageBucket: "GANTI.firebasestorage.app",
    messagingSenderId: "GANTI_SENDER_ID",
    appId: "GANTI_APP_ID"
  };

  function bounce() {
    location.replace('../index.html');
  }

  Promise.all([
    import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js')
  ]).then(function (mods) {
    var initializeApp = mods[0].initializeApp;
    var getAuth = mods[1].getAuth;
    var onAuthStateChanged = mods[1].onAuthStateChanged;
    var getFirestore = mods[2].getFirestore;
    var doc = mods[2].doc;
    var getDoc = mods[2].getDoc;

    var app = initializeApp(firebaseConfig);
    var auth = getAuth(app);
    var db = getFirestore(app);

    onAuthStateChanged(auth, function (user) {
      if (!user) { bounce(); return; }
      getDoc(doc(db, 'users', user.uid)).then(function (snap) {
        var accessUntil = snap.exists() ? Number(snap.data().accessUntil || 0) : 0;
        if (accessUntil > Date.now()) {
          document.documentElement.style.visibility = 'visible';
        } else {
          bounce();
        }
      }).catch(function (err) {
        console.error('[Node Tools] Guard: gagal cek akses', err);
        bounce();
      });
    });
  }).catch(function (err) {
    console.error('[Node Tools] Guard: gagal load Firebase', err);
    bounce();
  });
})();
