import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore"; // Import Firestore query methods
import bcrypt from "bcrypt";
import { StreamChat } from "stream-chat";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const serverClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export default async function handler(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if the email already exists in Firestore
    const usersCollection = collection(db, "users");
    const emailQuery = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(emailQuery);

    if (!querySnapshot.empty) {
      // If the querySnapshot is not empty, the email already exists
      return res.status(400).json({ error: "Email already exists" });
    }

    // If email does not exist, proceed with signup
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userId = email.split("@")[0];
    const tokenResponse = await serverClient.createToken(userId);

    await addDoc(usersCollection, {
      userId,
      password: hashedPassword,
      email,
      token: tokenResponse,
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
