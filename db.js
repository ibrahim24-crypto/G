// db.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// === Configuration Firebase (screen-clicker) ===
const firebaseConfig = {
  apiKey: "AIzaSyCcxCO_FdIaEzXKpHiwWwTxNt7ZRGwcyl8",
  authDomain: "screen-clicker.firebaseapp.com",
  projectId: "screen-clicker",
  storageBucket: "screen-clicker.appspot.com",
  messagingSenderId: "627573962958",
  appId: "1:627573962958:web:048f2577e436a30cf3389f",
  measurementId: "G-W3C5Y2YPBV"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Référence globale au document highscore global (si vous en avez un)
const highscoreRef = doc(db, "game", "highscore");

// Variable exportée pour garder le highscore en mémoire
export let highscore = 0;

// Charge le highscore global (par exemple dans “game” → document “highscore”)
export async function loadHighscore() {
  try {
    const docSnap = await getDoc(highscoreRef);
    if (docSnap.exists()) {
      highscore = docSnap.data().value || 0;
    }
  } catch (e) {
    console.error("Erreur chargement highscore:", e);
  }
}

// Sauvegarde le highscore s’il est plus élevé que celui en base
export async function saveHighscore(newScore) {
  try {
    if (newScore > highscore) {
      highscore = newScore;
      await setDoc(highscoreRef, { value: highscore }, { merge: true });
    }
  } catch (e) {
    console.error("Erreur de sauvegarde du highscore:", e);
  }
}

// Suit le visiteur (demande un nom si pas enregistré)
export async function trackVisitor() {
  try {
    let playerName = localStorage.getItem("playerName");
    if (!playerName) {
      // Si aucun nom dans localStorage, on le demande
      playerName = prompt("Entrez votre nom de joueur :");
      if (!playerName) {
        playerName = "guest_" + Date.now();
      }
      localStorage.setItem("playerName", playerName);
    }

    // Référence au document visitor → ID = playerName
    const visitorRef = doc(db, "visitors", playerName);
    const analyticsRef = doc(db, "analytics", "visitorData");

    // Récupérer le doc visitor (s’il existe)
    const visitorSnap = await getDoc(visitorRef);
    const isNewVisitor = !visitorSnap.exists();

    // Met à jour ou crée le doc du visiteur
    await setDoc(
      visitorRef,
      {
        lastVisit: serverTimestamp(),
        visits: visitorSnap.exists() ? increment(1) : 1,
        isNew: isNewVisitor
      },
      { merge: true }
    );

    // Met à jour le doc analytics/visitorData
    const analyticsSnap = await getDoc(analyticsRef);
    if (analyticsSnap.exists()) {
      await updateDoc(analyticsRef, {
        totalVisits: increment(1),
        uniqueVisitors: isNewVisitor ? increment(1) : increment(0)
      });
    } else {
      await setDoc(analyticsRef, {
        totalVisits: 1,
        uniqueVisitors: isNewVisitor ? 1 : 0
      });
    }
  } catch (error) {
    console.error("Error tracking visitor:", error);
  }
}

// Si vous souhaitez également exposer la référence Firestore pour d’autres queries :
export { db, auth };
