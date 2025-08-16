
# Sui zkLogin Demo
## デモサイト

---
### 主要機能
- zkLoginの7ステップ対話型デモンストレーション
- Google OAuthによるOpenID認証
- Sui Devnetブロックチェーンとのリアルタイム連携
- 多言語対応（英語・中国語）
- 各ステップの教育的コードスニペット表示
- ブラウザベースの暗号化キー管理

### zkLogin 7ステップ
1. 一時的な鍵ペア生成
2. JWT取得（Google OAuth）
3. JWTデコード
4. Salt生成
5. Suiアドレス生成
6. ZK証明取得
7. zkLogin署名生成

各ステップでコード例・状態・エラー・ストレージ情報を表示します。

---


## 技術スタック

cp .env .env.local
 `lib/` ... Sui SDKラッパー・API連携用（例: `suiClient.ts`）
`.env.local` を編集:
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth 2.0 Client ID
- `VITE_REDIRECT_URI`: リダイレクトURI（開発は `http://localhost:5173/`）

### 2. 依存インストール & 開発サーバー起動
```bash
npm install
npm run dev
```

### 3. コード品質チェック
```bash
npm run lint
npm run format
npx tsc --noEmit
```

---


## 実行環境・ストレージ戦略

- Sui Devnet上で動作
- すべてのユーザーデータはブラウザ（sessionStorage/localStorage）に保存
- ZK証明はMysten LabsのProverサービスへAPIリクエスト
- バックエンド不要

### 主要データの保存場所
| データ | 保存先 |
| --- | --- |
| 一時鍵ペア | sessionStorage |
| ランダムネス | sessionStorage |
| ユーザーSalt | localStorage |
| Max Epoch | localStorage |

SaltはlocalStorageに永続保存されるため、同じGoogleアカウントで再ログインすれば同じzkLoginアドレスが再現可能です。
ブラウザやデバイスが変わると、以前のアドレスにはアクセスできません。

---

## 保守性・設計方針

- TypeScript厳格モード・型安全
- 命名規則・インポート順序・interface活用
- React関数コンポーネント・フック・useMemo・useEffect
- エラーバウンダリー・ローディング状態・Snackbar通知
- Serena MCPによるコード探索・変更管理

---


## トラブルシューティング

- **ZK証明取得失敗**: SaltやRandomnessの不整合が原因。右上の「リセット」ボタンで全状態を初期化してください。
- **テストトークン取得失敗**: Faucetサーバーのリクエスト制限。Discordの [#devnet-faucet](https://discord.com/channels/916379725201563759/971488439931392130) で申請可能。
- その他の質問・要望はGitHub Issue/Pull Requestへ。
- zkLoginのFAQは [公式ドキュメント](https://docs.sui.io/concepts/cryptography/zklogin#faq) を参照。

---


## 主要コード例

```typescript
// zkLogin署名生成・トランザクション送信例
const txb = new TransactionBlock();
// ...コイン分割・送信...
txb.setSender(zkLoginUserAddress);
const { bytes, signature: userSignature } = await txb.sign({ client, signer: ephemeralKeyPair });
const addressSeed = genAddressSeed(BigInt(userSalt), "sub", decodedJwt.sub, decodedJwt.aud).toString();
const zkLoginSignature = getZkLoginSignature({ inputs: { ...partialZkLoginSignature, addressSeed }, maxEpoch, userSignature });
await suiClient.executeTransactionBlock({ transactionBlock: bytes, signature: zkLoginSignature });

// ZK証明取得例
const zkProofResult = await axios.post("https://prover-dev.mystenlabs.com/v1", { jwt: oauthParams?.id_token, extendedEphemeralPublicKey, maxEpoch, jwtRandomness: randomness, salt: userSalt, keyClaimName: "sub" }, { headers: { "Content-Type": "application/json" } }).data;
const partialZkLoginSignature = zkProofResult as PartialZkLoginSignature;

// Nonce生成例
import { generateNonce } from "@mysten/zklogin";
const nonce = generateNonce(ephemeralKeyPair.getPublicKey(), maxEpoch, randomness);
```

---


## 参考文献・リソース
- [A Complete Guide to zkLogin: How it Works and How to Integrate | Sui Network](https://www.youtube.com/watch?v=Jk4mq5IOUYc)
- [GitHub - polymedia-zklogin-demo](https://github.com/juzybits/polymedia-zklogin-demo?tab=readme-ov-file)
- [zkLogin Integration Guide](https://docs.sui.io/guides/developer/cryptography/zklogin-integration)

---

## 保守・運用Tips
- Serena MCPによるコード探索・変更管理・メモリ管理を推奨
- TypeScript型エラーゼロ・ESLint警告ゼロ・Biomeフォーマット済み
- console.log禁止・エラーバウンダリー必須
- テスト・ドキュメントの充実