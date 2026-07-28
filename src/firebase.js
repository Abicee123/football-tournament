import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAxP8GhEYdLVRPwhukUhyBOZKYtaGx0aT8",
  authDomain: "football-tournament-43652.firebaseapp.com",
  databaseURL: "https://football-tournament-43652-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "football-tournament-43652",
  storageBucket: "football-tournament-43652.firebasestorage.app",
  messagingSenderId: "884314452484",
  appId: "1:884314452484:web:55958d9ca7acc6adebbb51",
  measurementId: "G-9622VER5MM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Export so we can use it anywhere in the project
export { database };