import axios from 'axios';
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_SERVER;

interface  Account {
  "chainID": string,
  "challenge": string,
  "registrationData": object
}

interface  LoginAccount {
  "challenge": string,
  "authenticationData": object
}

export async function getChallenge()
{
  const response = await axios.post('/auth/challenge');
  return response.data;
}

export async function createAccount(data: Account)
{
  const response = await axios.post('/auth/create-account', data);
  return response.data;
}

export async function login(data: LoginAccount)
{
  const response = await axios.post('/auth/login', data);
  return response.data;
}