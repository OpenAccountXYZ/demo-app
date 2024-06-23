"use client"

import React, { useEffect, useState } from 'react';
import { AuthButton, useAuthWindow, verifySignature } from "openaccount-connect";
import {message} from 'antd';
import {Textarea} from "@nextui-org/react";
import {Button} from "@nextui-org/react";

export default function Home() {

  // authResult is the return value for the signature
  const { authResult } = useAuthWindow();

  // get challenge from server
  // const challenge = await fetch("/api/challenge");
  const challenge = crypto.getRandomValues(new Uint8Array(32)).toString();


  // Define an internal async function
  const verifySignatureAsync = async (authResult: any) => {
    try {
      // Call your validation signature function
      let status = await verifySignature(authResult);

      if (status) {
        message.success('Verify signature successfully')
      } else {
        message.error('Verify signature failed')
      }
    } catch (error) {
      // Error handling
      console.error('Error verifying signature:', error);
    }
  };

  const onPress = (e: any) => {
    verifySignatureAsync(authResult);
  }

  useEffect(() => {
    if (authResult) {
      // got user signature, handle user login
      message.success("Got user auth signature. Please veryify.")
    }
  }, [authResult]);


  return (
    <div className="justify-center align-center mt-[200px] p-[20px]" >
      <p className="text-4xl font-bold text-center">OpenAccount Connect Demo App</p>
      <AuthButton challenge={challenge}></AuthButton>
      <Textarea
        isReadOnly
        label="User Info"
        variant="bordered"
        value={authResult ? `Address: ${authResult.fullChallenge.account}\nChainID:${authResult.fullChallenge.chainID}` : ""}
        className="max-w"/>
      <Textarea
        isReadOnly
        label="Auth Result"
        variant="bordered"
        value={authResult ? JSON.stringify(authResult, null, 2) : ""}
        className="max-w"/>

      <Button color="primary" isDisabled={authResult === null} onClick={onPress}>
        Verify Auth Signature With EIP1271
      </Button>
    </div>
  );
}
