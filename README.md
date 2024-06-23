以下是一个示例文档，介绍如何在 React 项目中使用 `openaccount-connect` 库。此文档基于您提供的示例代码，并以 Markdown 格式编写。

# 使用 `openaccount-connect` 在 React 项目中进行身份验证

本文档将指导您如何在 React 项目中使用 `openaccount-connect` 库进行身份验证。通过示例代码，您将学习如何集成身份验证按钮、处理签名结果并验证签名。

## 安装

首先，确保您已经安装了 `openaccount-connect` 库：

```bash
npm install openaccount-connect antd
```

## 创建 `Home` 组件

接下来，创建一个 `Home` 组件，并在其中集成 `openaccount-connect` 库的功能。

```javascript
"use client"

import React, { useEffect } from 'react';
import { AuthButton, useAuthWindow, verifySignature } from "openaccount-connect";
import { message } from 'antd';


export default function Home() {
  // 从 useAuthWindow 获取签名结果
  const { authResult } = useAuthWindow();

  // 模拟从服务器获取挑战字符串
  const challenge = "your-challenge-string";

  // 定义异步函数以验证签名
  const verifySignatureAsync = async (authResult: any) => {
    try {
      // 调用验证签名函数
      let status = await verifySignature(authResult);

      if (status) {
        message.success('Signature successful');
      } else {
        message.error('Signature failure');
      }
    } catch (error) {
      // 错误处理
      console.error('Error verifying signature:', error);
    }
  };

  // 使用 useEffect 监控 authResult 的变化
  useEffect(() => {
    if (authResult) {
      verifySignatureAsync(authResult);
    }
  }, [authResult]);

  return (
    <div className="flex justify-center align-center mt-[200px] p-[20px]">
      <AuthButton challenge={challenge}></AuthButton>
    </div>
  );
}
```

## 组件说明

### 1. 引入依赖

```javascript
import React, { useEffect } from 'react';
import { AuthButton, useAuthWindow, verifySignature } from "openaccount-connect";
import { message } from 'antd';
```

首先，引入 `React`、`useEffect`、`openaccount-connect` 和 `antd` 库。

### 2. 获取签名结果

```javascript
const { authResult } = useAuthWindow();
```

使用 `useAuthWindow` 钩子获取签名结果 `authResult`。

### 3. 模拟挑战字符串

```javascript
const challenge = "your-challenge-string";
```

在实际应用中，您需要从服务器获取挑战字符串。这里我们使用一个模拟的挑战字符串。

### 4. 验证签名

```javascript
const verifySignatureAsync = async (authResult) => {
  try {
    let status = await verifySignature(authResult);

    if (status) {
      message.success('Signature successful');
    } else {
      message.error('Signature failure');
    }
  } catch (error) {
    console.error('Error verifying signature:', error);
  }
};
```

定义一个异步函数 `verifySignatureAsync` 来验证签名结果，并显示相应的消息。

### 5. 使用 `useEffect` 监控签名结果变化

```javascript
useEffect(() => {
  if (authResult) {
    verifySignatureAsync(authResult);
  }
}, [authResult]);
```

使用 `useEffect` 钩子监控 `authResult` 的变化，当 `authResult` 存在时调用 `verifySignatureAsync` 函数。

### 6. 渲染 `AuthButton` 组件

```javascript
return (
  <div className="flex justify-center align-center mt-[200px] p-[20px]">
    <AuthButton challenge={challenge}></AuthButton>
  </div>
);
```

在页面中渲染 `AuthButton` 组件，并将挑战字符串传递给 `challenge` 属性。

## 运行项目

完成以上步骤后，启动您的 React 项目，您将看到一个身份验证按钮。当用户进行身份验证并返回签名结果时，系统将自动验证签名并显示相应的消息。

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

这样，您就成功地在 React 项目中集成了 `openaccount-connect` 库的身份验证功能。


