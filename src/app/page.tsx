"use client"

import React, { useEffect } from 'react';
import { AuthButton , useAuthWindow, verifySignature} from "openaccount-connect";

export default function Home() {
  // authResult is the return value for the signature
  const { authResult } = useAuthWindow();

  // Define an internal async function
  const verifySignatureAsync = async (authResult: any) => {
    try {
      // Call your validation signature function
      let status = await verifySignature(authResult);
      alert(status)
    } catch (error) {
      // Error handling
      console.error('Error verifying signature:', error);
    }
  };

  useEffect(() => {
    if (authResult) {
      verifySignatureAsync(authResult)

    }
  }, [authResult]);



  return (
    <div className="flex justify-center align-center mt-[200px]" >
      <AuthButton challenge="your-challenge-string"></AuthButton>
      {authResult && <div>Auth Result: {JSON.stringify(authResult)}</div>}
    </div>
  );
}
