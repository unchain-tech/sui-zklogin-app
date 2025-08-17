---
project_name: Sui zkLogin Demo
project_description: "SuiブロックチェーンのzkLogin機能をインタラクティブに体験できるデモンストレーション用のWebアプリケーションです。GoogleのOAuth認証を利用して、バックエンドなしでSui上のアカウントを操作するフローを学習できます。"

tech_stack:
  - name: React
    version: "18.2.0"
    description: "UI構築のための主要なフロントエンドライブラリです。"
  - name: TypeScript
    description: "静的型付けを提供し、コードの堅牢性を高めます。"
  - name: Vite
    description: "高速な開発サーバーとビルドツールです。"
  - name: Sui.js
    version: "0.46.1"
    description: "Suiブロックチェーンと対話するための公式JavaScript/TypeScriptライブラリです。"
  - name: zkLogin
    version: "0.3.4"
    description: "SuiのzkLogin機能を実装するためのMysten Labs提供のライブラリです。"
  - name: Material-UI (MUI)
    version: "5"
    description: "UIコンポーネントライブラリとして使用しています。"
  - name: Biome
    version: "2.2.0"
    description: "コードフォーマッターとして利用しています。"
  - name: ESLint
    description: "静的コード解析ツールとして利用し、コード品質を維持します。"

project_structure:
  - path: src/
    description: "アプリケーションの主要なソースコードが含まれます。"
  - path: src/main.tsx
    description: "アプリケーションのエントリーポイントです。GlobalProviderとReact Routerがここで設定されます。"
  - path: src/App.tsx
    description: "メインのUIコンポーネントです。各UIパーツを組み合わせてページ全体を構成します。"
  - path: src/components/
    description: "再利用可能なReactコンポーネントが格納されています。ボタン、ダイアログ、ヘッダーなど、UIの各要素がここにあります。"
  - path: src/hooks/
    description: "カスタムフックが格納されています。Suiブロックチェーンとのやり取り (`useSui.ts`) やzkLoginの認証フロー (`useZKLogin.ts`) など、複雑なロジックはここにカプセル化されています。"
  - path: src/context/
    description: "アプリケーション全体の状態を管理するためのReact Context (`GlobalProvider.tsx`) があります。ユーザー情報や認証状態などを一元管理します。"
  - path: src/lib/
    description: "外部ライブラリのクライアント設定などを行います。`suiClient.ts` がSuiネットワークへの接続を初期化します。"
  - path: src/utils/
    description: "定数 (`constant.ts`) やテーマ設定など、プロジェクト全体で使われるユーティリティが格納されています。"
  - path: public/
    description: "静的アセット（画像など）が格納されています。"

key_commands:
  - command: npm install
    description: "プロジェクトの依存関係をインストールします。"
  - command: npm run dev
    description: "Vite開発サーバーを起動します。ホットリロードが有効です。"
  - command: npm run build
    description: "TypeScriptの型チェックを実行し、本番環境用にプロジェクトをビルドします。"
  - command: npm run lint
    description: "ESLintを実行して、コード内の潜在的な問題をチェックします。"
  - command: npm run format
    description: "Biomeを使って、プロジェクト全体のコードを整形します。"
  - command: npx tsc --noEmit
    description: "TypeScriptの型チェックのみを実行します。"

development_workflow: |
  1. **セットアップ**:
     - リポジトリをクローンし、ルートディレクトリで `npm install` を実行します。
     - `.env.example` をコピーして `.env.local` を作成し、`VITE_GOOGLE_CLIENT_ID` に有効なGoogle OAuthクライアントIDを設定します。

  2. **開発**:
     - `npm run dev` を実行して開発サーバーを起動します。
     - UIコンポーネントの変更は `src/components/` 内のファイルを編集します。
     - SuiブロックチェーンやzkLoginに関するロジックの変更は `src/hooks/` 内のカスタムフックを編集します。
     - グローバルな状態を追加・変更する場合は `src/context/GlobalProvider.tsx` と `src/types/globalContext.ts` を更新します。

  3. **コード品質の維持**:
     - コードをコミットする前に、`npm run format` でフォーマットし、`npm run lint` と `npx tsc --noEmit` を実行してエラーがないことを確認してください。

  4. **プルリクエスト**:
     - 変更が完了したら、プルリクエストを作成します。CI/CDパイプラインはありませんが、セルフチェックを推奨します。

coding_conventions:
  - convention: "TypeScriptの厳格な型付け (`strict: true`) を遵守します。"
  - convention: "コンポーネントは関数コンポーネントとフックを使用して実装します。"
  - convention: "ロジックとビューの分離を意識し、複雑な処理はカスタムフック (`src/hooks/`) に切り出します。"
  - convention: "命名規則はキャメルケース (`variableName`, `functionName`) とパスカルケース (`ComponentName`, `TypeName`) を使い分けます。"
  - convention: "状態管理は、複数のコンポーネントで共有されるものは `GlobalProvider` を利用し、それ以外はコンポーネント内の `useState` を使用します。"
  - convention: "`console.log` は開発中のみ使用し、本番ビルドからは自動的に削除されます。デバッグ目的で残さないようにしてください。"

serena_mcp_integration:
  description: "このプロジェクトでは、AIコーディングアシスタント「Serena MCP」の利用が推奨されています。Serenaは `.serena/` ディレクトリ内の設定ファイルとメモリに基づいて動作し、開発効率を向上させます。"
  activation: "特定の有効化コマンドはありません。Serenaが利用可能な環境でこのプロジェクトを開くと、`.serena/project.yml` が自動的に読み込まれ、Serenaの機能が有効になります。"
  workflow_integration:
    - step: "**コード理解と探索**"
      details: "機能追加やバグ修正に着手する前に、Serenaのコード探索ツール (`find_symbol`, `search_for_pattern` など) を活用して、関連するコードや既存の実装パターンを把握します。"
    - step: "**安全なコード編集**"
      details: "Serenaの編集ツール (`replace_lines`, `insert_at_line` など) を利用することで、構文を壊すことなく安全かつ効率的にコードを修正できます。"
    - step: "**プロジェクト知識の共有**"
      details: "プロジェクトに関する重要な決定事項やアーキテクチャのパターンは、Serenaのメモリ機能 (`write_memory`) を使って記録・共有し、チーム全体の認識を統一します。"
---