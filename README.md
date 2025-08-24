# Sui zkLogin Demo

## 画面イメージ

![](./docs/0.png)

## 事前準備

**Google Cloud** で OAuth 用のクライアント ID を発行して環境変数にセットすること

OAuth クライアントの設定

- Web アプリケーション
- リダイレクト URI
  - http://localhost:5173/
  - https://<固有値>.supabase.co/auth/v1/callback
- クライアント ID とクライアントシークレットを取得
- Supabase ダッシュボードで以下の内容を設定
  - Authentication → Providers → Google を有効化
  - クライアント ID とクライアントシークレットを設定
  - リダイレクト URI を設定
    - https://<固有値>.supabase.co/auth/v1/callback

```bash
VITE_GOOGLE_CLIENT_ID=
```

## Supabase でデータベースとテーブルを作成する

**Supabase** でアカウントを作成した後に以下のSQLを実行する。

```sql
-- ユーザープロフィールを保存するテーブル
CREATE TABLE profiles (
  -- ランダムに生成されたUUIDをキーとする
  id uuid PRIMARY KEY,
  -- Googleから取得するsub ID（重複を許可しない）
  sub text UNIQUE NOT NULL,
  name text,
  email text,
  user_salt text NOT NULL,
  max_epoch integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- インデックスの追加（subカラムでの検索性能向上のため）
CREATE INDEX idx_profiles_sub ON profiles(sub);

-- updated_atカラムの自動更新関数の作成
CREATE OR REPLACE FUNCTION update_updated_at_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_atカラムの自動更新トリガー
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

さらに以下の値の環境変数を設定する

```txt
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

---

### 主要機能

- zkLogin の 7 ステップ対話型デモンストレーション
- Google OAuth による OpenID 認証
- Sui Devnet ブロックチェーンとのリアルタイム連携
- 多言語対応（英語・中国語）
- 各ステップの教育的コードスニペット表示
- ブラウザベースの暗号化キー管理

### zkLogin 7 ステップ

1. 一時的な鍵ペア生成
   - 有効期限と公開鍵を組み合わせてナンスも生成する
   - 一時的な鍵ペアはアプリ内に保存される想定
     - 本デモアプリではブラウザのローカルストレージを使用.
       ※ 本番環境ではこの設定は非推奨
2. JWT 取得（Google などの OAuth プロバイダーから取得する）
   - Google
   - Apple
   - Twitch
   - Facebook
3. JWT デコード
4. Salt 生成
   - ソルトは、OAuth 情報（iss, aud, sub）を元に生成する
5. Sui アドレス生成
   - OAuth プロバイダー側のユーザー情報と Sui のアドレスが紐づかないようになっているのが **大事なポイント**
   - 上記の Slat とナンスの値を元に決定される
6. ZK 証明取得
   - 一度生成されたゼロ知識証明は、一時鍵の有効期限が切れるまで複数のトランザクションに再利用可能。
7. zkLogin 署名生成

各ステップでコード例・状態・エラー・ストレージ情報を表示します。

---

## 技術スタック

cp .env .env.local
`lib/` ... Sui SDK ラッパー・API 連携用（例: `suiClient.ts`）
`.env.local` を編集:

- `VITE_GOOGLE_CLIENT_ID`: Google OAuth 2.0 Client ID
- `VITE_REDIRECT_URI`: リダイレクト URI（開発は `http://localhost:5173/`）

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

- Sui Devnet 上で動作
- すべてのユーザーデータはブラウザ（sessionStorage/localStorage）に保存
- ZK 証明は Mysten Labs の Prover サービスへ API リクエスト
- バックエンド不要

### 主要データの保存場所

| データ        | 保存先         |
| ------------- | -------------- |
| 一時鍵ペア    | sessionStorage |
| ランダムネス  | sessionStorage |
| ユーザー Salt | localStorage   |
| Max Epoch     | localStorage   |

Salt は localStorage に永続保存されるため、同じ Google アカウントで再ログインすれば同じ zkLogin アドレスが再現可能です。
ブラウザやデバイスが変わると、以前のアドレスにはアクセスできません。

---

## 保守性・設計方針

- TypeScript 厳格モード・型安全
- 命名規則・インポート順序・interface 活用
- React 関数コンポーネント・フック・useMemo・useEffect
- エラーバウンダリー・ローディング状態・Snackbar 通知
- Serena MCP によるコード探索・変更管理

---

## トラブルシューティング

- **ZK 証明取得失敗**: Salt や Randomness の不整合が原因。右上の「リセット」ボタンで全状態を初期化してください。
- **テストトークン取得失敗**: Faucet サーバーのリクエスト制限。Discord の [#devnet-faucet](https://discord.com/channels/916379725201563759/971488439931392130) で申請可能。
- その他の質問・要望は GitHub Issue/Pull Request へ。
- zkLogin の FAQ は [公式ドキュメント](https://docs.sui.io/concepts/cryptography/zklogin#faq) を参照。

---

## 主要コード例

```typescript
// zkLogin署名生成・トランザクション送信例
const txb = new TransactionBlock();
// ...コイン分割・送信...
txb.setSender(zkLoginUserAddress);
const { bytes, signature: userSignature } = await txb.sign({
  client,
  signer: ephemeralKeyPair,
});
const addressSeed = genAddressSeed(
  BigInt(userSalt),
  "sub",
  decodedJwt.sub,
  decodedJwt.aud
).toString();
const zkLoginSignature = getZkLoginSignature({
  inputs: { ...partialZkLoginSignature, addressSeed },
  maxEpoch,
  userSignature,
});
await suiClient.executeTransactionBlock({
  transactionBlock: bytes,
  signature: zkLoginSignature,
});

// ZK証明取得例
const zkProofResult = await axios.post(
  "https://prover-dev.mystenlabs.com/v1",
  {
    jwt: oauthParams?.id_token,
    extendedEphemeralPublicKey,
    maxEpoch,
    jwtRandomness: randomness,
    salt: userSalt,
    keyClaimName: "sub",
  },
  { headers: { "Content-Type": "application/json" } }
).data;
const partialZkLoginSignature = zkProofResult as PartialZkLoginSignature;

// Nonce生成例
import { generateNonce } from "@mysten/zklogin";
const nonce = generateNonce(
  ephemeralKeyPair.getPublicKey(),
  maxEpoch,
  randomness
);
```

---

## 保守・運用 Tips

- Serena MCP によるコード探索・変更管理・メモリ管理を推奨
- TypeScript 型エラーゼロ・ESLint 警告ゼロ・Biome フォーマット済み
- console.log 禁止・エラーバウンダリー必須
- テスト・ドキュメントの充実

---

## 技術要素

1. **OpenID Connect (OIDC) と JSON Web Token (JWT)**

   - OIDC は、Google などのプロバイダーがユーザー認証に使用する標準的なプロトコルです。
   - ユーザーが OIDC プロバイダー（OP）にログインし、認証に成功すると、署名付きの JWT（JSON Web Token） を取得します。
   - JWT は、ヘッダー、ペイロード、署名の 3 つの部分で構成され、ユーザーに関する情報を JSON 形式で含みます。zkLogin は、この JWT を認証の基盤として利用します。

2. **一時的なキーペア (Ephemeral Key Pair)**
   - ユーザーは JWT を取得する前に、一時的に利用する秘密鍵と公開鍵のペア（sk_u, vk_u、または eph_sk, eph_pk）を生成します。
   - この一時的な公開鍵 (vk_u または eph_pk) は、OIDC プロトコルにおける**nonce パラメータ**に埋め込まれます。nonce はリプレイ攻撃を防ぐための使い捨ての値です。
   - この鍵はセッション中のみ利用され、ユーザーが覚える必要はありません。
3. **ゼロ知識証明 (Zero-Knowledge Proof, ZKP)**
   - ZKP は、「個人情報や取引内容といった詳細を相手に伝えることなく、取引が正しいことを相手に証明する」技術です。
   - zkLogin は ZKP を用いて、JWT のペイロードに含まれる名前やメールアドレスなどの機密情報を公開せずに、ユーザーが JWT の有効な所有者であり、その nonce に vk_u が含まれていることを証明します。
   - ZKP の実装には、効率的な証明サイズと検証時間を持つ Groth16 が利用されています。
4. **ソルト (Salt)**
   - JWT にはユーザーを一意に特定するための sub（subject）ID が含まれますが、これを直接ウォレットアドレスに使用するとプライバシー侵害のリスクがあります。
   - そこで、zkLogin では**salt と呼ばれるランダムな値**をユーザーの ID（sub）、アプリケーション ID（aud）、OP の ID（iss）と組み合わせてアドレスを生成します。
   - salt が存在することで、salt を知らない限り、zkLogin アドレスとそのオフチェーン ID を直接紐付けることはできません。これにより、プライバシーが保護されます。
5. **ZK 証明サービス (ZK Proving Service)**
   - ZKP の生成は計算リソースを多く消費するため、zkLogin は ZKP の生成を専門のバックエンドサーバー（ZK 証明サービス）にオフロードするオプションを提供します。
   - このサービスは一時的な秘密鍵を知ることがないため、単独で完全な zkLogin 署名を作成することはできません。

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
- [Web3 を身近にする技術 Sui の zkLogin とは](https://nft-studying.com/zklogin/)
