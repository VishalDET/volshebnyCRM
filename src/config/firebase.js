import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC7NEe9NLvL6EC-3yyT2Habb6avj-_SAMY",
    authDomain: "volshebny-e277f.firebaseapp.com",
    projectId: "volshebny-e277f",
    storageBucket: "volshebny-e277f.firebasestorage.app",
    messagingSenderId: "1011754869054",
    appId: "1:1011754869054:web:c052bb08888a09626c4c6f"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export default app;
