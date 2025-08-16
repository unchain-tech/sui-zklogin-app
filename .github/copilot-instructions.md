# Sui zkLogin Demo - Copilot 指示書

Serena MCPを使ってプロジェクトをアクティベートしてください。

## プロジェクト概要
このプロジェクトは、Sui zkLogin認証フローの完全なデモンストレーションを提供する教育用Reactアプリケーションです。Web2からWeb3への認証橋渡し技術であるzkLoginプロセスを、インタラクティブかつステップバイステップで理解・体験できるアプリケーションです。

### 主要機能
- zkLoginの7ステップ対話型デモンストレーション
- OpenIDプロバイダーとしてのGoogle OAuth統合
- 実際のSui Devnetブロックチェーンとのリアルタイム連携
- 多言語対応（英語・中国語）
- 各ステップの教育的コードスニペット表示
- ブラウザベースの暗号化キー管理

## 技術スタック

### コア技術
- **React 18** + **TypeScript 5.0.2**
- **Vite 4.4.5** (HMR対応ビルドツール)
- **Material-UI v5** (メインUIフレームワーク)
- **Tailwind CSS** (ユーティリティファーストスタイリング)

### Suiブロックチェーン統合
- `@mysten/sui.js` (v0.46.1) - Sui SDK
- `@mysten/dapp-kit` (v0.9.0) - Sui用Reactフック
- `@mysten/zklogin` (v0.3.4) - zkLogin機能
- `@noble/curves` - 暗号化操作

### 状態管理
- Reactフック (useState, useEffect, useMemo)
- `@tanstack/react-query` サーバー状態管理
- ブラウザストレージ (sessionStorage/localStorage)

## コードスタイルと規約

### 命名規則
- **コンポーネント**: PascalCase (`App`, `StyledSnackbarProvider`)
- **関数**: camelCase (`generateNonce`, `requestFaucet`)
- **定数**: SCREAMING_SNAKE_CASE (`CLIENT_ID`, `FULLNODE_URL`)
- **ファイル**: ユーティリティはkebab-case、コンポーネントはPascalCase

### TypeScriptガイドライン
- 厳格モード有効 - 常に適切な型を提供する
- 複雑なpropsには interface を使用
- 定数オブジェクトには `const` アサーションを推奨
- APIレスポンスには適切なジェネリック型を使用

### インポート整理順序
```typescript
// 1. 外部ライブラリ (React, MUI, etc.)
import { useState, useEffect } from "react";
import { Button, Typography } from "@mui/material";

// 2. Sui関連ライブラリ (グループ化)
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { generateNonce } from "@mysten/zklogin";

// 3. 内部ユーティリティとコンポーネント
import { CLIENT_ID, FULLNODE_URL } from "./utils/constant";
import { StyledSnackbarProvider } from "./components/StyledSnackbarProvider";

// 4. アセット（最後）
import GoogleLogo from "./assets/google.svg";
```

### Reactパターン
- 関数コンポーネントとフックのみを使用
- zkLogin操作に適切なエラーバウンダリーを実装
- 計算コストが高い処理（アドレス生成、nonce作成）には `useMemo` を使用
- すべての非同期操作にローディング状態を実装

## アーキテクチャガイドライン

### コンポーネント構造
```typescript
// 推奨コンポーネント構造
function ComponentName() {
  // 1. ステートフック
  const [loading, setLoading] = useState(false);
  
  // 2. コンテキストフック
  const { t } = useTranslation();
  
  // 3. クエリフック
  const { data } = useSuiClientQuery(/* ... */);
  
  // 4. 計算値
  const computedValue = useMemo(() => {
    // コストの高い計算
  }, [dependencies]);
  
  // 5. イベントハンドラー
  const handleClick = async () => {
    // 実装
  };
  
  // 6. エフェクト
  useEffect(() => {
    // 副作用
  }, []);
  
  // 7. レンダー
  return (/* JSX */);
}
```

### エラーハンドリングパターン
```typescript
try {
  setLoading(true);
  const result = await riskyOperation();
  enqueueSnackbar("成功しました！", { variant: "success" });
} catch (error) {
  console.error(error);
  enqueueSnackbar(String(error), { variant: "error" });
} finally {
  setLoading(false);
}
```

## zkLogin固有のガイドライン

### ステップ実装パターン
各zkLoginステップは以下を満たすべきです：
1. **前提条件の検証**: 前のステップが完了しているかチェック
2. **明確なUI提供**: 現在の状態と次のアクションを表示
3. **コード例表示**: 学習用の教育的スニペット
4. **優雅なエラーハンドリング**: ユーザーフレンドリーなエラーメッセージ
5. **状態の永続化**: 適切なストレージ（session/local）に保存

### キーストレージ戦略
```typescript
// 一時データ（ブラウザ終了時にクリア）
sessionStorage.setItem(KEY_PAIR_SESSION_STORAGE_KEY, privateKey);
sessionStorage.setItem(RANDOMNESS_SESSION_STORAGE_KEY, randomness);

// 永続データ（ブラウザ再起動後も保持）
localStorage.setItem(USER_SALT_LOCAL_STORAGE_KEY, userSalt);
localStorage.setItem(MAX_EPOCH_LOCAL_STORAGE_KEY, maxEpoch);
```

### 暗号化操作
- `@mysten/sui.js` を使用してEd25519キーペアを生成
- `@mysten/zklogin` の `generateRandomness()` を使用
- 暗号化操作前に常に入力値を検証
- ユーザー確認用に公開鍵を表示

## UI/UXガイドライン

### Material-UI使用方法
- コンポーネント固有のスタイルには `sx` プロパティを使用
- `src/theme/colors/` で定義されたテーマカラーに従う
- ローディング状態には `LoadingButton` を実装
- ステップナビゲーションには `Stepper` コンポーネントを使用

### レスポンシブデザイン
- すべてのzkLoginステップでモバイル互換性を確保
- 複雑な操作には適切なブレークポイントを使用
- モバイルユーザーのタッチインタラクションを考慮

### アクセシビリティ
- 明確なステップ進行インジケーターを提供
- 適切なARIAラベルを持つセマンティックHTMLを使用
- すべてのステップでキーボードナビゲーションが動作することを確保
- 視覚的要素には代替テキストを提供

## 開発ワークフロー

### 変更前の確認事項
```bash
# 開発サーバー起動
npm run dev

# 現在のコード品質確認
npm run lint
npm run format
npx tsc --noEmit
```

### Serena MCP活用
プロジェクトの深い理解とコード分析にSerena MCPを積極的に活用してください：

#### プロジェクト探索
```
# プロジェクトをアクティブ化
mcp_serena_activate_project

# ディレクトリ構造の確認
mcp_serena_list_dir (recursive: true, relative_path: ".")

# ファイル検索
mcp_serena_find_file (file_mask: "*.tsx", relative_path: "src")
```

#### コードシンボル分析
```
# ファイルのシンボル概要取得
mcp_serena_get_symbols_overview (relative_path: "src/App.tsx")

# 特定のシンボル検索
mcp_serena_find_symbol (name_path: "App", relative_path: "src")

# 参照元の検索
mcp_serena_find_referencing_symbols (name_path: "generateNonce", relative_path: "src/App.tsx")
```

#### パターン検索とコード理解
```
# 特定のパターン検索
mcp_serena_search_for_pattern (substring_pattern: "zkLogin|generateNonce")

# メモリ管理
mcp_serena_write_memory (memory_name: "zkLogin実装メモ", content: "...")
mcp_serena_read_memory (memory_file_name: "zkLogin実装メモ")
```

#### コード修正
```
# シンボルの置換
mcp_serena_replace_symbol_body (name_path: "functionName", relative_path: "src/file.ts", body: "新しい実装")

# シンボル前後への挿入
mcp_serena_insert_before_symbol / mcp_serena_insert_after_symbol
```

### テストチェックリスト
zkLogin機能を修正する際は：
- [ ] 7つのステップすべてが順番通りに動作する
- [ ] Google OAuthフローが正常に完了する
- [ ] 暗号化操作が有効な結果を生成する
- [ ] ZK証明生成が成功する
- [ ] Devnetでのトランザクション実行が動作する
- [ ] ブラウザセッション間での状態永続化が動作する
- [ ] エラーハンドリングが適切なメッセージを表示する
- [ ] 多言語切り替えが正常に機能する

### コード品質基準
- **TypeScriptエラーゼロ**: すべての型エラーを修正
- **ESLint準拠**: すべてのリンティング警告に対処
- **フォーマット済みコード**: コミット前にBiomeフォーマッターを実行
- **console.logなし**: 適切なエラーハンドリングに置き換え
- **適切なエラーバウンダリー**: zkLogin失敗をキャッチして処理

## 一般的なパターンとユーティリティ

### Suiアドレス生成
```typescript
// zkLoginアドレス生成の標準パターン
const zkLoginUserAddress = useMemo(() => {
  if (!userSalt || !jwtString) return "";
  return jwtToAddress(jwtString, userSalt);
}, [userSalt, jwtString]);
```

### ZK証明リクエストパターン
```typescript
const fetchZKProof = async () => {
  try {
    setFetchingZKProof(true);
    const response = await axios.post(SUI_PROVER_DEV_ENDPOINT, {
      jwt: jwtToken,
      extendedEphemeralPublicKey,
      maxEpoch,
      jwtRandomness: randomness,
      salt: userSalt,
      keyClaimName: "sub"
    });
    setZkProof(response.data);
  } catch (error) {
    // ZK証明生成失敗の処理
  } finally {
    setFetchingZKProof(false);
  }
};
```

### トランザクション実行パターン
```typescript
const executeTransaction = async () => {
  const txb = new TransactionBlock();
  // トランザクション構築...
  
  const { bytes, signature: userSignature } = await txb.sign({
    client: suiClient,
    signer: ephemeralKeyPair
  });
  
  const zkLoginSignature = getZkLoginSignature({
    inputs: { ...zkProof, addressSeed },
    maxEpoch,
    userSignature
  });
  
  await suiClient.executeTransactionBlock({
    transactionBlock: bytes,
    signature: zkLoginSignature
  });
};
```

## セキュリティ考慮事項
- 秘密鍵や機密な暗号化素材をログ出力しない
- 暗号化操作前にすべてのユーザー入力を検証
- すべての暗号化操作に安全な乱数生成を使用
- コンポーネントのアンマウント時に適切なクリーンアップを実装
- localStorageデータの取り扱いに注意 - ユーザーsaltは重要

## デバッグとトラブルシューティング

### よくある問題
1. **ZK証明生成失敗**: ランダム性の一貫性を確認
2. **トランザクション実行失敗**: アドレスに十分な残高があることを確認
3. **JWTデコードエラー**: 適切なOAuthフロー完了を確認
4. **ストレージ問題**: 状態が破損した場合はブラウザストレージをクリア

### Serena MCPを使った問題分析
複雑な問題の分析時にはSerena MCPを活用：

```
# エラーが発生している箇所の分析
mcp_serena_find_symbol (name_path: "エラー関数名", include_body: true)

# 関連する参照の確認
mcp_serena_find_referencing_symbols (name_path: "問題のある関数")

# 類似パターンの検索
mcp_serena_search_for_pattern (substring_pattern: "try.*catch|error.*handling")

# 分析結果をメモリに保存
mcp_serena_write_memory (memory_name: "バグ分析_YYYYMMDD", content: "問題と解決策")
```

### 表示すべきデバッグ情報
- 現在のepochとmax epoch値
- 生成されたnonce値
- 公開鍵（秘密鍵は絶対に表示しない）
- 成功したトランザクション実行後のダイジェスト
- コンテキスト付きエラーメッセージ

重要な注意：これはzkLoginの概念を教育するためのデモです。包括的なエラーハンドリングとユーザーガイダンスを備えた、明確で理解しやすいコードを優先してください。

## Serena MCP統合のベストプラクティス

### 開発開始時の推奨フロー
1. **プロジェクトアクティブ化**: `mcp_serena_activate_project`
2. **onboarding確認**: `mcp_serena_check_onboarding_performed`
3. **既存メモリ確認**: `mcp_serena_list_memories`
4. **プロジェクト構造把握**: `mcp_serena_list_dir`

### 新機能開発時
1. **関連シンボル検索**: 既存の類似実装を`mcp_serena_find_symbol`で探索
2. **依存関係分析**: `mcp_serena_find_referencing_symbols`で影響範囲を把握
3. **実装パターン検索**: `mcp_serena_search_for_pattern`で既存パターンを確認
4. **設計メモ保存**: `mcp_serena_write_memory`で設計決定を記録

### リファクタリング時
1. **現在の実装分析**: `mcp_serena_get_symbols_overview`でファイル全体を把握
2. **使用箇所特定**: `mcp_serena_find_referencing_symbols`で全ての参照を確認
3. **段階的な修正**: `mcp_serena_replace_symbol_body`で安全に置換
4. **変更履歴記録**: メモリに変更理由と影響を保存

### コードレビュー準備
```
# 変更した関数の完全性確認
mcp_serena_find_symbol (name_path: "変更した関数", include_body: true)

# 関連するテストケースの確認
mcp_serena_search_for_pattern (substring_pattern: "test.*関数名|関数名.*test")

# レビューポイントをメモリに整理
mcp_serena_write_memory (memory_name: "レビューポイント_機能名", content: "変更点とテスト項目")
```
