import { FirebaseApp, initializeApp } from "firebase/app";
import { Firestore, getFirestore } from 'firebase/firestore'

export class Firebase {

    static firebaseConfig: any
    static app: FirebaseApp
    static db: Firestore
    static {
        if (import.meta.env.VITE_FS_PUBLIC_KEY) {
            this.firebaseConfig = JSON.parse(atob(import.meta.env.VITE_FS_PUBLIC_KEY as string));
            this.app = initializeApp(this.firebaseConfig)
            this.db = getFirestore(this.app)
        }
    }

    static env(path: string) {
        const pathWithoutHeadSlash = path.startsWith('/') ? path.slice(1) : path
        const e = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
        return `/envs/${e}/${pathWithoutHeadSlash}`
    }
}
