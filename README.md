# Sui zkLogin Demo App

## 画面イメージ

![](./docs/0.png)

## 事前準備

### 環境変数のテンプレファイルを作成する

```bash
cp .env.example .env.local
```

セットアップが必要な環境変数は以下の通り

```txt
# Google OAuth Configuration(これはダミー値)
VITE_GOOGLE_CLIENT_ID=

# Sui Configuration  
VITE_SUI_NETWORK_NAME="devnet"
VITE_SUI_FULLNODE_URL=https://fullnode.devnet.sui.io
VITE_SUI_DEVNET_FAUCET=https://faucet.devnet.sui.io
VITE_SUI_PROVER_DEV_ENDPOINT=https://prover-dev.mystenlabs.com/v1

# Application Configuration
VITE_REDIRECT_URI=http://localhost:5173/

VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

```

### Google Cloud で OAuth 用のクライアント ID を発行すること

**Google Cloud** で OAuth 用のクライアント ID を発行して環境変数にセットすること。

**Google Cloud** でアカウントを持っていない場合は新規作成すること。

OAuth クライアントの設定例

- [Google Cloud コンソール](https://console.cloud.google.com/apis/credentials)にアクセス
- **認証情報を作成** をクリック
- 以下の設定で新しい認証情報を作成する
  - Web アプリケーション
  - リダイレクト URI
    - http://localhost:5173/
  - クライアント ID とクライアントシークレットを取得する
- クライアント IDを環境変数に設定

  ```text
  VITE_GOOGLE_CLIENT_ID=
  ```

### Supabase でデータベースとテーブルを作成する

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

さらに以下の値の環境変数を追加で設定する

```txt
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### NFTコントラクトをデプロイする

- [Sui Faucetサイト](https://faucet.sui.io/?network=devnet)にて、Devnet用のFaucetを取得する

- [Chain IDE](https://chainide.com/s/sui/461d77b23e934de4bad422db11cf3d0d)でNFTコントラクトをビルド・デプロイする(テンプレをそのまま使う形でOK!)。

- デプロイしたコントラクトのパッケージIDを取得する

- `utils/constant.ts` にある以下の変数にパッケージIDを設定する
  ```ts
  export const NFT_PACKAGE_ID=<ここに設定>
  ```

## 動かし方

- **インストール**

   ```bash
   bun i
   ```

- **ビルド**

   ```bash
   bun run build
   ```

- **起動**

   ```bash
   bun run dev
   ```

- **フォーマッター適用(オプション)**

   ```bash
   bun run format
   ```

## 主要機能

- zkLogin認証機能
- Google OAuth による OpenID 認証能
- supabase連携によるユーザーソルトの保管能
- JWTとユーザーソルトを元にしたSuiウォレット導出能
- 1 SUIの送金デモ機能
- NFTのミントデモ機能

### zkLogin ８ ステップ

1. 一時的な鍵ペア生成
   - 有効期限と公開鍵を組み合わせてナンスも生成する
   - 一時的な鍵ペアはアプリ内に保存される想定
     - 本デモアプリではブラウザのローカルストレージを使用. 

        ※ 本番環境ではこの設定は非推奨

2. JWT 取得（Google などの OAuth プロバイダーから取得する）
   - Google(今回使うのはGoogleだけ)
   - Apple
   - Twitch
   - Facebook
3. JWT デコード
4. ユーザーソルト 生成
5. Sui アドレス生成
   - OAuth プロバイダー側のユーザー情報と Sui のアドレスが紐づかないようになっているのが **大事なポイント**
   - 上記の ユーザー と JWT を元に決定される
6. ZK 証明取得
   - 一度生成されたゼロ知識証明は、一時鍵の有効期限が切れるまで複数のトランザクションに再利用可能。
7. zkLogin 署名生成
8. トランザクション送信

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
   - ZKP は、**「個人情報や取引内容といった詳細を相手に伝えることなく、取引が正しいことを相手に証明する」** 技術です。
   - zkLogin は ZKP を用いて、JWT のペイロードに含まれる名前やメールアドレスなどの機密情報を公開せずに、ユーザーが JWT の有効な所有者であり、その nonce に vk_u が含まれていることを証明します。
   - ZKP の実装には、効率的な証明サイズと検証時間を持つ Groth16 が利用されています。
4. **ユーザーソルト**
   - JWT にはユーザーを一意に特定するための sub（subject）ID が含まれますが、これを直接ウォレットアドレスに使用するとプライバシー侵害のリスクがあります。
   - そこで、zkLogin では**salt と呼ばれるランダムな値**をユーザーの ID（sub）、アプリケーション ID（aud）、OP の ID（iss）と組み合わせてアドレスを生成します。
   - salt が存在することで、salt を知らない限り、zkLogin アドレスとそのオフチェーン ID を直接紐付けることはできません。これにより、プライバシーが保護されます。
5. **ZK 証明サービス (ZK Proving Service)**
   - ZKP の生成は計算リソースを多く消費するため、zkLogin は ZKP の生成を専門のバックエンドサーバー（ZK 証明サービス）にオフロードするオプションを提供します。
   - このサービスは一時的な秘密鍵を知ることがないため、単独で完全な zkLogin 署名を作成することはできません。

---

## (参考)検証用にデプロイしたスマートコントラクト

### Test NFT

[DEVNET - 0xc0b3c942c105481e797765f3ee9ee7b76e23fc60f2e054e46bafd54d2f9d426b](https://suiscan.xyz/devnet/object/0xc0b3c942c105481e797765f3ee9ee7b76e23fc60f2e054e46bafd54d2f9d426b/contracts)

[Chain IDE](https://chainide.com/s/sui/461d77b23e934de4bad422db11cf3d0d)

## 参考文献・リソース

- [A Complete Guide to zkLogin: How it Works and How to Integrate | Sui Network](https://www.youtube.com/watch?v=Jk4mq5IOUYc)
- [GitHub - polymedia-zklogin-demo](https://github.com/juzybits/polymedia-zklogin-demo?tab=readme-ov-file)
- [zkLogin Integration Guide](https://docs.sui.io/guides/developer/cryptography/zklogin-integration)
- [[論文レビュー] zkLogin: Privacy-Preserving Blockchain Authentication with Existing Credentials](https://www.themoonlight.io/ja/review/zklogin-privacy-preserving-blockchain-authentication-with-existing-credentials)
- [Web3 を身近にする技術 Sui の zkLogin とは](https://nft-studying.com/zklogin/)
