/* eslint-disable @typescript-eslint/no-explicit-any */

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../main"; // Import from your main.tsx

export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // This gives you the Google Access Token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    
    // The signed-in user info
    const user = result.user;
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      },
      token
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
};