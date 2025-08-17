
# Sui zkLogin Demo

![](./docs/0.png)

## 事前準備

**Google Cloud** でOAuth用のクライアントIDを発行して環境変数にセットすること

```bash
VITE_GOOGLE_CLIENT_ID=
```

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
    - 有効期限と公開鍵を組み合わせてナンスも生成する
    - 一時的な鍵ペアはアプリ内に保存される想定
      - 本デモアプリではブラウザのローカルストレージを使用. 
        ※ 本番環境ではこの設定は非推奨
2. JWT取得（Google などのOAuthプロバイダーから取得する）
    - Google
    - Apple
    - Twitch
    - Facebook
3. JWTデコード
4. Salt生成
    - ソルトは、OAuth情報（iss, aud, sub）を元に生成する
5. Suiアドレス生成
    - OAuthプロバイダー側のユーザー情報とSuiのアドレスが紐づかないようになっているのが **大事なポイント**
    - 上記のSlatとナンスの値を元に決定される
6. ZK証明取得
    - 一度生成されたゼロ知識証明は、一時鍵の有効期限が切れるまで複数のトランザクションに再利用可能。
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

## 保守・運用Tips
- Serena MCPによるコード探索・変更管理・メモリ管理を推奨
- TypeScript型エラーゼロ・ESLint警告ゼロ・Biomeフォーマット済み
- console.log禁止・エラーバウンダリー必須
- テスト・ドキュメントの充実

---

## 技術要素

1. **OpenID Connect (OIDC) と JSON Web Token (JWT)**
    - OIDC は、Googleなどのプロバイダーがユーザー認証に使用する標準的なプロトコルです。
    - ユーザーがOIDCプロバイダー（OP）にログインし、認証に成功すると、署名付きのJWT（JSON Web Token） を取得します。
    - JWTは、ヘッダー、ペイロード、署名の3つの部分で構成され、ユーザーに関する情報をJSON形式で含みます。zkLoginは、このJWTを認証の基盤として利用します。

2. **一時的なキーペア (Ephemeral Key Pair)**
    - ユーザーはJWTを取得する前に、一時的に利用する秘密鍵と公開鍵のペア（sk_u, vk_u、またはeph_sk, eph_pk）を生成します。
    - この一時的な公開鍵 (vk_uまたはeph_pk) は、OIDCプロトコルにおける**nonceパラメータ**に埋め込まれます。nonceはリプレイ攻撃を防ぐための使い捨ての値です。
    - この鍵はセッション中のみ利用され、ユーザーが覚える必要はありません。
3. **ゼロ知識証明 (Zero-Knowledge Proof, ZKP)**
    - ZKP は、「個人情報や取引内容といった詳細を相手に伝えることなく、取引が正しいことを相手に証明する」技術です。
    - zkLoginはZKPを用いて、JWTのペイロードに含まれる名前やメールアドレスなどの機密情報を公開せずに、ユーザーがJWTの有効な所有者であり、そのnonceにvk_uが含まれていることを証明します。
    - ZKPの実装には、効率的な証明サイズと検証時間を持つGroth16が利用されています。
4. **ソルト (Salt)**
    - JWTにはユーザーを一意に特定するためのsub（subject）IDが含まれますが、これを直接ウォレットアドレスに使用するとプライバシー侵害のリスクがあります。
    - そこで、zkLoginでは**saltと呼ばれるランダムな値**をユーザーのID（sub）、アプリケーションID（aud）、OPのID（iss）と組み合わせてアドレスを生成します。
    - saltが存在することで、saltを知らない限り、zkLoginアドレスとそのオフチェーンIDを直接紐付けることはできません。これにより、プライバシーが保護されます。
5. **ZK証明サービス (ZK Proving Service)**
    - ZKPの生成は計算リソースを多く消費するため、zkLoginはZKPの生成を専門のバックエンドサーバー（ZK証明サービス）にオフロードするオプションを提供します。
    - このサービスは一時的な秘密鍵を知ることがないため、単独で完全なzkLogin署名を作成することはできません。

---

## 検証用のスマートコントラクト

### Test NFT

[DEVNET - 0xc0b3c942c105481e797765f3ee9ee7b76e23fc60f2e054e46bafd54d2f9d426b](https://suiscan.xyz/devnet/object/0xc0b3c942c105481e797765f3ee9ee7b76e23fc60f2e054e46bafd54d2f9d426b/contracts)

[Chain IDE](https://chainide.com/s/sui/461d77b23e934de4bad422db11cf3d0d)

## 参考文献・リソース
- [A Complete Guide to zkLogin: How it Works and How to Integrate | Sui Network](https://www.youtube.com/watch?v=Jk4mq5IOUYc)
- [GitHub - polymedia-zklogin-demo](https://github.com/juzybits/polymedia-zklogin-demo?tab=readme-ov-file)
- [zkLogin Integration Guide](https://docs.sui.io/guides/developer/cryptography/zklogin-integration)
- [[論文レビュー] zkLogin: Privacy-Preserving Blockchain Authentication with Existing Credentials](https://www.themoonlight.io/ja/review/zklogin-privacy-preserving-blockchain-authentication-with-existing-credentials)
- [Web3を身近にする技術 SuiのzkLoginとは](https://nft-studying.com/zklogin/)