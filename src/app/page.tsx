"use client"

import React, { useEffect, useState } from 'react';
import { AuthButton, useAuthWindow, verifySignature } from "openaccount-connect";
import { message } from 'antd';
import { Link, Textarea } from "@nextui-org/react";
import { Button } from "@nextui-org/react";

export default function Home() {

  // authResult is the return value for the signature
  const { authResult } = useAuthWindow();

  // get challenge from server
  // const challenge = await fetch("/api/challenge");
  const challenge = crypto.getRandomValues(new Uint8Array(32)).toString();

  const [userInfo, setUserInfo] = useState("");


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
      message.error('Verify signature failed')
      // Error handling
      console.error('Error verifying signature:', error);
    }
  };

  const onPress = (e: any) => {
    verifySignatureAsync(authResult);
  }

  useEffect(() => {
    if (authResult && (authResult as any).signature) {
      // got user signature, handle user login
      message.success("Got user auth signature. Please veryify.")
      let fullChallenge: any = (authResult as any).fullChallenge;
      // `Address: ${fullChallenge?.account}\nChainID:${fullChallenge.chainID}`
      setUserInfo(`Address: ${fullChallenge?.account}\nChainID:${fullChallenge.chainID}`)
    }
  }, [authResult]);


  return (
    <div className="justify-center align-center mt-[40px] p-[20px]" >
      <p className="text-4xl font-bold text-center mb-[100px]">OpenAccount Demo App</p>
      <div className="flex justify-center align-center mt-[00px] mb-[80px]">
        <AuthButton challenge={challenge}></AuthButton>
      </div>

      {/* <div className="flex justify-center align-center mt-[20px] mb-[20px] max-w-[600px]"> */}
        {
          authResult && <Textarea
            isReadOnly
            label="User Info"
            variant="bordered"
            value={userInfo}
            className="max-w mb-[20px]" />
        }
      {/* </div> */}
      {/* <div className="flex justify-center align-center mt-[20px] mb-[20px] max-w-[600px]"> */}
        {
          authResult && <Textarea
            isReadOnly
            label="Auth Result"
            variant="bordered"
            value={JSON.stringify(authResult, null, 2)}
            className="max-w" />
        }
        {/* </div> */}
      <div className="flex justify-center align-center mt-[20px] mb-[20px]">
        <Button color="primary"
          isDisabled={authResult === null}
          onClick={onPress}
        >
          Verify Auth Signature With EIP1271
        </Button>
      </div>

      <div className="flex justify-center align-center mt-[20px] mb-[20px]">
        <Link
          isExternal
          showAnchorIcon
          href="https://mirror.xyz/oaxyz.eth/kQtlGDckhN6NhS7hEpnJKKkbYrKAUHxg31R7XW_-Xko"
        >
          What is OpenAccount?
        </Link>
        </div>
      <div className="flex justify-center align-center mt-[20px] mb-[20px]">
        <Link
            isExternal
            showAnchorIcon
            href="https://github.com/OpenAccountXYZ/demo-app"
          >
            Visit source code on GitHub.
          </Link>
      </div>
    </div>
  );
}
