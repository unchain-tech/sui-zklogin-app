import { SuiClient } from "@mysten/sui.js/client";
import { FULLNODE_URL } from "./constant";

// SuiClient の共有インスタンス
export const suiClient = new SuiClient({ url: FULLNODE_URL });
