"use client"

import React, { useEffect, useState } from 'react';
import { AuthButton, useAuthWindow, verifySignature } from "openaccount-connect";
import { message, Input } from 'antd';

const { TextArea } = Input;

export default function Home() {

  // authResult is the return value for the signature
  const { authResult } = useAuthWindow();

  // get challenge from server
  // const challenge = await fetch("/api/challenge");

  const challenge = "your-challenge-string"


  // Define an internal async function
  const verifySignatureAsync = async (authResult: any) => {
    try {
      // Call your validation signature function
      let status = await verifySignature(authResult);

      if (status) {
        message.success('Signature successful')
      } else {
        message.error('Signature failure')
      }
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



    </div>
  );
}
