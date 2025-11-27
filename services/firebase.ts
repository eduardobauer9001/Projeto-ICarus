
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDYqMWUNHuUXpPDZ_FSS3WOGYlFruayYgo",
  authDomain: "projeto-icarus.firebaseapp.com",
  projectId: "projeto-icarus",
  storageBucket: "projeto-icarus.firebasestorage.app",
  messagingSenderId: "900944953696",
  appId: "1:900944953696:web:0e7e53f807ed78cd241e05",
  measurementId: "G-8KTKDD8M3H"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços para serem usados no App.tsx
export const auth = getAuth(app);
export const db = getFirestore(app);
