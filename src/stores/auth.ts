
import { getAuth, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { Firebase } from '@/helpers/firebase';
import { defineStore } from 'pinia'

interface State {
  user: null|User
  loggedIn: boolean
}

export const useAuthStore = defineStore('auth', {
  persist: true,
  state: (): State => {
    return {
      user: null,
      loggedIn: false,
    }
  },
  actions: {
    listenAuthStateChange() {
      const auth = getAuth(Firebase.app)
      onAuthStateChanged(auth, (user) => {
        if (user) {
          this.user = user
          this.loggedIn = true
          console.debug('ログインユーザのID', user.uid)
        } else {
          this.user = null
          this.loggedIn = false
        }
      })
    },
    signOut() {
      const auth = getAuth(Firebase.app);
      auth.languageCode = 'ja';
      signOut(auth).then(() => {
        // 現状はトップページからしかログアウトできないが、
        // どこからでもログアウト可能にした場合には、
        // ページ遷移の処理が必要
      })
    },
    signIn() {
      signIn()
    },
  },
})

function signIn() {
  const provider = new GoogleAuthProvider();
  const auth = getAuth(Firebase.app);
  auth.languageCode = 'ja';
  signInWithPopup(auth, provider).then((result) => {
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential) {
      console.error('Google login faied')
      return
    }
    const token = credential.accessToken;
    // The signed-in user info.
    const user = result.user;
    console.debug(user)
    // router.push('/')
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
    console.error(error)
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
}