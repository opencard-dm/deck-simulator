<template>
  <div>
    <o-button variant="grey-dark" @click="login()"
      >Google ログイン</o-button
    >
  </div>
</template>

<script setup lang="ts">
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Firebase } from '@/helpers/firebase';
import { useRouter } from 'vue-router';
const router = useRouter()

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

function login() {
  const auth = getAuth(Firebase.app);
  auth.languageCode = 'ja';

  signInWithPopup(auth, provider)
  .then((result) => {
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
    router.push('/')
    // IdP data available using getAdditionalUserInfo(result)
    // ...
  }).catch((error) => {
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
</script>

<style lang="scss">
</style>
