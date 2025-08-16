import { SuiClient } from "@mysten/sui.js/client";
import { FULLNODE_URL } from "../utils/constant";

// Sui Clientの初期化 - 共通で使用するため単独ファイルとして分離
export const suiClient = new SuiClient({ url: FULLNODE_URL });
