// guard.js — WAJIB ditaruh PALING ATAS <head>, sebelum tag/script lain, di SETIAP tools/<slug>.html:
//   <script src="../guard.js"></script>
//
// Tugasnya: ngecek user udah login Google + masih punya sisa akses (timer gratis ATAU timer tambahan
// admin, atau akun admin) SEBELUM konten tool kebuka. Kalau enggak, halaman langsung dilempar balik ke
// index.html (biar user ketemu layar login/mulai-timer/akses-abis di sana) tanpa sempat lihat isi tool.
//
// firebaseConfig di bawah ini HARUS SAMA PERSIS dengan firebaseConfig di index.html. Kalau kamu ganti
// project Firebase, update di DUA tempat itu.
(() => {
  'use strict';

  // Sembunyiin seluruh halaman dulu sampai status akses jelas, biar konten tool gak sempat kelihatan
  // (walau cuma sekilas) sebelum ketauan boleh diakses apa nggak.
  const hideStyle = document.createElement('style');
  hideStyle.textContent = 'html{visibility:hidden!important}';
  document.head.appendChild(hideStyle);

  const firebaseConfig = {
    apiKey: "AIzaSyD6H9BVv-8lMi-YM7i69cjattWzMBHfHkg",
    authDomain: "node-tools-ctfy.firebaseapp.com",
    projectId: "node-tools-ctfy",
    storageBucket: "node-tools-ctfy.firebasestorage.app",
    messagingSenderId: "1065352327411",
    appId: "1:1065352327411:web:904f269ddfaf86edb7c786"
  };
  const ADMIN_EMAILS = ['myxrin2748@gmail.com', 'namskyfr@gmail.com'];
  const HOME_URL = '../index.html'; // lokasi index.html relatif dari tools/<slug>.html -- ubah kalau struktur folder beda

  let settled = false;
  const reveal = () => { if (!settled) { settled = true; hideStyle.remove(); } };
  const deny = () => { if (!settled) { settled = true; location.replace(HOME_URL); } };

  // Kalau Firebase lemot/gak respons, jangan nyangkut nutup selama-lamanya -- lempar balik ke home.
  const failsafe = setTimeout(deny, 12000);

  (async () => {
    try {
      const [{ initializeApp }, authMod, fsMod] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js')
      ]);

      const app = initializeApp(firebaseConfig);
