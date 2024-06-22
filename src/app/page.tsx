"use client"

import React, { useEffect } from 'react';
import { AuthButton, useAuthWindow, verifySignature } from "openaccount-connect";

export default function Home() {
  // authResult is the return value for the signature
  const { authResult } = useAuthWindow();
  const challenge = "your-challenge-string"

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
    <div className="flex justify-center align-center mt-[200px] p-[20px]" >
      <AuthButton challenge={challenge}></AuthButton>
      {authResult && <div>Auth Result: {JSON.stringify(authResult)}</div>}

      {/* <div className="flex justify-center items-center px-3 py-2.5 text-center rounded-lg border border-solid border-zinc-300 md:w-[579px] max-md:px-5">
        <div className="flex gap-3">
          <div className="flex flex-col justify-center text-3xl font-medium leading-5 text-white whitespace-nowrap">
            <div className="justify-center items-center leading-[3.25rem] bg-black rounded-2xl h-[52px] w-[52px]">
              OP
            </div>
          </div>
          <div className="my-auto text-2xl leading-7 text-zinc-900">
            Sign in with OpenAccount
          </div>
        </div>
      </div> */}


    </div>
  );
}
