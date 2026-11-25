import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || "",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || "",
}

export const firestoreDatabaseId =
  import.meta.env.VITE_FIRESTORE_DATABASE_ID?.trim() || "portfolio"

const REQUIRED_ENV_MAP: Array<[keyof typeof envConfig, string]> = [
  ["apiKey", "VITE_FIREBASE_API_KEY"],
  ["authDomain", "VITE_FIREBASE_AUTH_DOMAIN"],
  ["projectId", "VITE_FIREBASE_PROJECT_ID"],
  ["appId", "VITE_FIREBASE_APP_ID"],
]

export const missingEnvVars = REQUIRED_ENV_MAP.filter(
  ([key]) => !envConfig[key]
).map(([, envName]) => envName)

export const isFirebaseConfigured = missingEnvVars.length === 0

export const allowedEmails = (import.meta.env.VITE_ALLOWED_EMAIL || "")
  .split(",")
  .map((email: string) => email.trim().toLowerCase())
  .filter(Boolean)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null
let googleProvider: GoogleAuthProvider | null = null

if (isFirebaseConfigured) {
  app = getApps().length > 0 ? getApps()[0] : initializeApp(envConfig)
  auth = getAuth(app)
  db = getFirestore(app, firestoreDatabaseId)
  storage = getStorage(app)
  googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: "select_account" })
}

export { app, auth, db, storage, googleProvider, envConfig }
