export const FULLNODE_URL =
  import.meta.env.VITE_SUI_FULLNODE_URL || "https://fullnode.devnet.sui.io";
export const CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "573120070871-0k7ga6ns79ie0jpg1ei6ip5vje2ostt6.apps.googleusercontent.com";
export const REDIRECT_URI =
  import.meta.env.VITE_REDIRECT_URI || "https://sui-zklogin.vercel.app/";
export const SUI_DEVNET_FAUCET =
  import.meta.env.VITE_SUI_DEVNET_FAUCET || "https://faucet.devnet.sui.io";
export const SUI_PROVER_DEV_ENDPOINT =
  import.meta.env.VITE_SUI_PROVER_DEV_ENDPOINT ||
  "https://prover-dev.mystenlabs.com/v1";
export const KEY_PAIR_SESSION_STORAGE_KEY = "demo_ephemeral_key_pair";
export const USER_SALT_LOCAL_STORAGE_KEY = "demo_user_salt_key_pair";
export const RANDOMNESS_SESSION_STORAGE_KEY = "demo_randomness_key_pair";
export const MAX_EPOCH_LOCAL_STORAGE_KEY = "demo_max_epoch_key_pair";

export const STEPS_LABELS = [
  "Generate Ephemeral Key Pair",
  "Fetch JWT",
  "Decode JWT",
  "Generate Salt",
  "Generate user Sui address",
  "Fetch ZK Proof",
  "Assemble zkLogin signature",
];

export const STEPS_DESC = [
  "The ephemeral key pair is used to sign the TransactionBlock",
  "From OpenID Provider",
  "Needed for assembling zkLogin signature later",
  "User address determined by JWT and Salt together",
  "Transaction signing requires ZK Proof",
  "Submit Transaction",
];

// NFTのパッケージID
export const NFT_PACKAGE_ID =
  "0xc0b3c942c105481e797765f3ee9ee7b76e23fc60f2e054e46bafd54d2f9d426b";
