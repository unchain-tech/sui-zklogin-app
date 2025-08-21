// 今回はDevnetに接続する
export const FULLNODE_URL =
  import.meta.env.VITE_SUI_FULLNODE_URL || "https://fullnode.devnet.sui.io";
// クライアントIDはGogole Cloudのコンソールで設定したものを使用
export const CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const REDIRECT_URI =
  import.meta.env.VITE_REDIRECT_URI;
export const SUI_DEVNET_FAUCET =
  import.meta.env.VITE_SUI_DEVNET_FAUCET || "https://faucet.devnet.sui.io";
export const SUI_PROVER_DEV_ENDPOINT =
  import.meta.env.VITE_SUI_PROVER_DEV_ENDPOINT ||
  "https://prover-dev.mystenlabs.com/v1";
export const KEY_PAIR_SESSION_STORAGE_KEY = "demo_ephemeral_key_pair";
export const RANDOMNESS_SESSION_STORAGE_KEY = "demo_randomness_key_pair";

// NFTのパッケージID(Chain IDEを使って事前にデプロイしておく！)
export const NFT_PACKAGE_ID =
  "0x3f9cd80debc244723ecb3c9748b52be1251130cdc28de545f701c6177520a8d7";
