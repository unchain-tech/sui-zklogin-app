# Sui zkLogin Demo

## An example that breaks down the logic behind each step of zkLogin.

### Explore here:
[https://sui-zklogin.vercel.app](https://sui-zklogin.vercel.app)

This example breaks down the complete process of Sui zkLogin into seven steps, as follows:

1. Generate ephemeral key pair
2. Fetch JWT
3. Decode JWT
4. Generate salt
5. Generate user Sui address
6. Fetch ZK proof
7. Assemble zkLogin signature

Each step includes corresponding code snippets, providing instructions on how to obtain the required data for each step.

## Operating environment

The example runs in Sui Devnet. All data the user generates is stored locally on the client-side (browser). The acquisition of the zero-knowledge proof (ZK proof) is done through a call to the [Mysten Labs-maintained proving service](../zklogin.mdx#call-the-mysten-labs-maintained-proving-service). Therefore, running the example does not require an additional deployed backend server (or a Docker container).

## Storage locations for key data

The following table lists the storage location for key data the example uses:

| Data | Storage location |
| --- | --- |
| Ephemeral key pair | `window.sessionStorage` |
| Randomness | `window.sessionStorage` | 
| User salt | `window.localStorage` | 
| Max epoch | `window.localStorage` | 

Because the user salt is stored long-term in the browser's `localStorage`, as long as the `localStorage` is not cleared manually, you can use the same JWT (in this example, logging in with the same Google account) to access the corresponding zkLogin address generated from the current salt value at any time.

Changing browsers or devices results in the inability to access previously generated Sui zkLogin addresses, even when using the same JWT.

## Troubleshooting

- **ZK Proof request failure:**
  - This might occur because of inconsistencies in the creation of multiple randomness or user salts, causing request failures. Click the **Reset Button** in the top right corner of the UI to restart the entire process.

- **Request test tokens failure:**
  - This is because you have surpassed the faucet server request frequency limitations. 
  - You can go to Sui [#devnet-faucet](https://discord.com/channels/916379725201563759/971488439931392130) or [#testnet-faucet](https://discord.com/channels/916379725201563759/1037811694564560966) Discord channels to claim test coins.

- Any suggestions are welcome on the project's GitHub repo through raised issues, and of course, pull requests are highly appreciated.

- For more FAQs about zkLogin, you can check [zkLogin FAQ](https://docs.sui.io/concepts/cryptography/zklogin#faq).

## Code Example

```ts
export const BUILD_ZKLOGIN_SIGNATURE = `const txb = new TransactionBlock();

// Transfer 1 SUI to 0xfa0f...8a36.
const [coin] = txb.splitCoins(txb.gas,[MIST_PER_SUI * 1n]);
txb.transferObjects(
  [coin],
  "0xfa0f8542f256e669694624aa3ee7bfbde5af54641646a3a05924cf9e329a8a36"
);
txb.setSender(zkLoginUserAddress);

const { bytes, signature: userSignature } = await txb.sign({
  client,
  signer: ephemeralKeyPair
});

// Generate addressSeed using userSalt, sub, and aud (JWT Payload)
// as parameters for obtaining zkLoginSignature
const addressSeed: string = genAddressSeed(
  BigInt(userSalt),
  "sub",
  decodedJwt.sub,
  decodedJwt.aud
).toString();

// partialZkLoginSignature()
const zkLoginSignature: SerializedSignature = getZkLoginSignature({
  inputs: {
    ...partialZkLoginSignature,
    addressSeed,
  },
  maxEpoch,
  userSignature,
});

// Execute transaction
suiClient.executeTransactionBlock({
  transactionBlock: bytes,
  signature: zkLoginSignature,
});
`

export const AXIOS_ZKPROOF = `const zkProofResult = await axios.post(
  "https://prover-dev.mystenlabs.com/v1",
  {
    jwt: oauthParams?.id_token as string,
    extendedEphemeralPublicKey: extendedEphemeralPublicKey,
    maxEpoch: maxEpoch,
    jwtRandomness: randomness,
    salt: userSalt,
    keyClaimName: "sub",
  },
  {
    headers: {
      "Content-Type": "application/json",
    },
  }
).data;

const partialZkLoginSignature = zkProofResult as PartialZkLoginSignature
`

export const GENERATE_NONCE = `import { generateNonce } from "@mysten/zklogin";

 // Generate Nonce for acquiring JWT:
 const nonce = generateNonce(
   ephemeralKeyPair.getPublicKey(),
   maxEpoch,
   randomness
 );`
```

## 参考文献
- [A Complete Guide to zkLogin: How it Works and How to Integrate | Sui Network](https://www.youtube.com/watch?v=Jk4mq5IOUYc)
- [GitHub - polymedia-zklogin-demo](https://github.com/juzybits/polymedia-zklogin-demo?tab=readme-ov-file)
- [zkLogin Integration Guide](https://docs.sui.io/guides/developer/cryptography/zklogin-integration)