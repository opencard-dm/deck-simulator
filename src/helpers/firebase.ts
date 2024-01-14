import { Features } from "@/features";
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

export class Firebase {

    static firebaseConfig: any;
    static firebase: any;
    static db: any;
    static {
        if (Features.battle) {
            this.firebaseConfig = JSON.parse(atob(import.meta.env.VITE_FS_PUBLIC_KEY as string));
            this.firebase = initializeApp(this.firebaseConfig)
            this.db = getFirestore(this.firebase)
        }
    }

    static env(path: string) {
        const pathWithoutHeadSlash = path.startsWith('/') ? path.slice(1) : path
        const e = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
        return `/envs/${e}/${pathWithoutHeadSlash}`
    }
}
