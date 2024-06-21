import { client } from "@passwordless-id/webauthn";
import { ECDSASigValue } from "@peculiar/asn1-ecc";
import { AsnParser } from "@peculiar/asn1-schema";
import { Base64Url, SoulWallet } from "@soulwallet/sdk";
import { Contract, JsonRpcProvider, hashMessage, keccak256 } from "ethers";

// the data that is passed from the app
export interface OAChallenge {
    challenge: string;
    statement: string | null;
    requestID: number | null;
    expireTime: number | null;
};

// 1. convert OAChallenge to OAFullChallenge
export interface OAFullChallenge extends OAChallenge {
    version: string; // "1.0.0"
    origin: string; // "http://localhost:3000"
    uri: string; // "http://localhost:3000/sdfsdf/sdf"
    account: string;
    chainID: number;

    issueTime: number;
    notBefore: number | null;
};

function OAFullChallengeToString(challenge: OAFullChallenge): string {
    return `${challenge.origin} wants you to sign in with your Ethereum account:
${challenge.account}

${challenge.statement}

Version: ${challenge.version}
URI: ${challenge.uri}
Challenge: ${challenge.challenge}
Request ID: ${challenge.requestID}
Chain ID: ${challenge.chainID}
Issue Time: ${challenge.issueTime}
Not Before: ${challenge.notBefore}
Expire Time: ${challenge.expireTime}
`;
}

const RPC_URL = "https://sepolia.optimism.io"
const BUNDLER_URL = "https://api.pimlico.io/v2/optimism-sepolia/rpc?apikey=da8c37e8-9ccc-4928-ab88-615b7de5c088"
const soulWalletFactory = "0xF78Ae187CED0Ca5Fb98100d3F0EAB7a6461d6fC6"
const defaultCallbackHandler = "0x880c6eb80583795625935B08AA28EB37F16732C7"
const socialRecoveryModule = "0x3Cc36538cf53A13AF5C28BB693091e23CF5BB567"
const SoulWalletDefaultValidator =  "0x82621ac52648b738fEdd381a3678851933505762"

const soulWallet = new SoulWallet(
    RPC_URL,
    BUNDLER_URL,
    soulWalletFactory,
    defaultCallbackHandler,
    socialRecoveryModule,
);

async function HashOAFullChallenge(challenge: OAFullChallenge): Promise<{
    packedHash: string;
    validationData: string;
}> {
    const message = OAFullChallengeToString(challenge);
    const hash = hashMessage(message);
    const packed1271HashRet = await soulWallet.getEIP1271TypedData(challenge.account, hash);
    if (packed1271HashRet.isErr()) {
        throw new Error(packed1271HashRet.ERR.message);
    }
    const typedMessage = packed1271HashRet.OK.typedMessage;
    const packedHashRet = await soulWallet.packRawHash(typedMessage);
    if (packedHashRet.isErr()) {
        throw new Error(packedHashRet.ERR.message);
    }
    return packedHashRet.OK;
}

interface ICredential {
    id: string;
    publicKey: string;
    algorithm: string;
}

// 2. sign the packed hash with the credential
export async function PasskeySign(credential: ICredential, challenge: OAFullChallenge): Promise<string> {
    const packedHash = await HashOAFullChallenge(challenge);
    const signatureData = await signByPasskey(credential, packedHash.packedHash);
    const packedSignatureRet = await soulWallet.packUserOpP256Signature(
        SoulWalletDefaultValidator,
        signatureData,
        packedHash.validationData);
    if (packedSignatureRet.isErr()) {
        throw new Error(packedSignatureRet.ERR.message);
    }

    return packedSignatureRet.OK;
}

// 3. return the packed signature to app
interface IOAResponse{
    fullChallenge: OAFullChallenge,
    signature: string
}


export const uint8ArrayToHexString = (byteArray: Uint8Array) => {
    return Array.from(byteArray)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
};

const decodeDER = (signatureBase64: string) => {
    const derSignature = Buffer.from(signatureBase64, 'base64');  // base64ToBuffer(signature);
    const parsedSignature = AsnParser.parse(derSignature, ECDSASigValue);
    let rBytes = new Uint8Array(parsedSignature.r);
    let sBytes = new Uint8Array(parsedSignature.s);
    if (rBytes.length === 33 && rBytes[0] === 0) {
      rBytes = rBytes.slice(1);
    }
    if (sBytes.length === 33 && sBytes[0] === 0) {
      sBytes = sBytes.slice(1);
    }
    const r = `0x${uint8ArrayToHexString(rBytes).padStart(64, '0')}`;
    const s = `0x${uint8ArrayToHexString(sBytes).padStart(64, '0')}`;

    return {
      r,
      s,
    };
};

const base64urlTobase64 = (base64url: string) => {
    const paddedUrl = base64url.padEnd(base64url.length + ((4 - (base64url.length % 4)) % 4), '=');
    return paddedUrl.replace(/\-/g, '+').replace(/_/g, '/');
  };
  
const base64Tobase64url = (base64: string) => {
return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const base64ToBigInt = (base64String: string) => {
    const binaryString = atob(base64String);
    let result = BigInt(0);
    for (let i = 0; i < binaryString.length; i++) {
        result = (result << BigInt(8)) | BigInt(binaryString.charCodeAt(i));
    }
    return result;
};

const signByPasskey = async (credential: ICredential, hash: string) => {
    const challenge = Base64Url.bytes32Tobase64Url(hash);

    let authentication = await client.authenticate([credential.id], challenge);
    const authenticatorData = `0x${base64ToBigInt(base64urlTobase64(authentication.authenticatorData)).toString(16)}`;
    const clientData = atob(base64urlTobase64(authentication.clientData));

    const sliceIndex = clientData.indexOf(`","origin"`);
    const clientDataSuffix = clientData.slice(sliceIndex);
    const signatureBase64 = base64urlTobase64(authentication.signature);
    const { r, s } = decodeDER(signatureBase64);

    return {
        messageHash: hash,
        publicKey: credential.publicKey,
        r,
        s,
        authenticatorData,
        clientDataSuffix,
    };
};

// 4. app verify the signature
export async function verifySignature(IOAResponse: IOAResponse): Promise<boolean> {
    const provider = new JsonRpcProvider(RPC_URL);
    const hash = hashMessage(OAFullChallengeToString(IOAResponse.fullChallenge));
    return verify1271(provider, IOAResponse.fullChallenge.account, hash, IOAResponse.signature);
}


const magicValue = '0x1626ba7e';
const eip1271Abi = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "_messageHash",
                "type": "bytes32"
            },
            {
                "name": "_signature",
                "type": "bytes"
            }
        ],
        "name": "isValidSignature",
        "outputs": [
            {
                "name": "magicValue",
                "type": "bytes4"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
]

async function verify1271(provider: JsonRpcProvider, signerAddress: string, hash: string, signature: string): Promise<boolean> {
    const bytecode = await provider.getCode(signerAddress);
    if (!bytecode || bytecode === '0x' ||
        bytecode === '0x0' || bytecode === '0x00') {
        return false;
    }

    const contract = new Contract(signerAddress, eip1271Abi, provider);
    const result = await contract.isValidSignature(hash, signature)
    console.log(`${result}`);
    return result.toLowerCase() === magicValue;
}