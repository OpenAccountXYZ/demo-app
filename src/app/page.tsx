"use client"

import { Button } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import openaccount from "openaccount-connect";

export default function Home() {
  const { authResult, openAuthWindow } = openaccount.useAuthWindow();

  const handleButtonClick = () => {
    // openAuthWindow('https://account.test.oa.xyz', window.location.origin, "1234567890");
    openAuthWindow('http://localhost:3001/', window.location.origin, "1234567890");

    // openAuthWindow("/");
    // openAuthWindow('/?callback_origin=' + 'https://www.google.com');

  };

  // 定义一个内部的 async 函数
  const verifySignatureAsync = async (authResult: any) => {
    try {
      // 调用你的异步函数
      let status = await openaccount.verifySignature(authResult);
      console.log("🚀 ~ verifySignatureAsync ~ status:", status)
      alert(status)
    } catch (error) {
      // 错误处理
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
      <Button color="primary" onClick={handleButtonClick}>Open Auth Window</Button>
      {authResult && <div>Auth Result: {JSON.stringify(authResult)}</div>}
    </div>
  );
}
