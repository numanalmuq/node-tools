/*
  guard.js — pelindung halaman tools/*.html.
  Taruh PALING ATAS <head> tiap tool: <script src="../guard.js"></script>
  Letak file: sejajar dengan index.html (bukan di dalam tools/).

  Halaman disembunyiin dulu. Kebuka cuma kalau sudah login DAN (admin ATAU timer gratis/bonus masih nyala).
  Belum mulai timer / waktu habis -> balik ke index.html. Kalau waktu habis pas tool lagi dipakai,
  halaman langsung dikunci saat itu juga (bukan nunggu refresh).
  Catatan: ini gembok sisi-browser (halaman statis), jadi buat ngeblok pemakaian normal, bukan anti-oprek.
*/
(() => {
  const root = document.documentElement;
  root.style.visibility = 'hidden';

  const ADMIN_EMAILS = ['myxrin2748@gmail.com', 'namskyfr@gmail.com'];
  const HOME = new URL('index.html', document.currentScript.src).href;
  const kick = () => location.replace(HOME);

  // Harus sama persis dengan firebaseConfig di index.html
  const firebaseConfig = {
    apiKey: "AIzaSyD6H9BVv-8lMi-YM7i69cjattWzMBHfHkg",
    authDomain: "node-tools-ctfy.firebaseapp.com",
    projectId: "node-tools-ctfy",
    storageBucket: "node-tools-ctfy.firebasestorage.app",
    messagingSenderId: "1065352327411",
    appId: "1:1065352327411:web:904f269ddfaf86edb7c786"
  };

  (async () => {
    try {
      const B = 'https://www.gstatic.com/firebasejs/12.7.0/';
      const [{ initializeApp }, { getAuth, onAuthStateChanged }, { getFirestore, doc, onSnapshot }] = await Promise.all([
        import(B + 'firebase-app.js'), import(B + 'firebase-auth.js'), import(B + 'firebase-firestore.js')
      ]);
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app), db = getFirestore(app);
      let lockTimer = null, unsub = null;

      onAuthStateChanged(auth, (user) => {
        if (unsub) { unsub(); unsub = null; }
        clearTimeout(lockTimer);
        if (!user) return kick();
        if (ADMIN_EMAILS.includes((user.email || '').toLowerCase())) { root.style.visibility = ''; return; }

        unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
          clearTimeout(lockTimer);
          const d = snap.data() || {};
          const left = Math.max(Number(d.freeUntil || 0), Number(d.bonusUntil || 0)) - Date.now();
          if (left <= 0) return kick();       // belum mulai timer, atau sudah habis
          root.style.visibility = '';
          lockTimer = setTimeout(kick, left + 300); // kunci otomatis pas waktu habis
        }, kick);
      });
    } catch (err) {
      console.error('[Node Tools] guard gagal:', err);
      kick();
    }
  })();
})();
