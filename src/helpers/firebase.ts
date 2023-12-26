import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = JSON.parse(atob(import.meta.env.VITE_FS_PUBLIC_KEY as string));

export const firebase = initializeApp(firebaseConfig);
export const db = getFirestore(firebase)
export function env(path: string) {
    const pathWithoutHeadSlash = path.startsWith('/') ? path.slice(1) : path
    const e = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
    return `/envs/${e}/${pathWithoutHeadSlash}`
}
