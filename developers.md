# Sapphillon CLI - Developer Guide

このドキュメントでは、Sapphillon CLIの開発方法について説明します。

## 前提条件

- [Deno](https://deno.land/) v1.x以上
- Make (オプション、推奨)
- Git

## セットアップ

### 1. リポジトリのクローン

```bash
git clone https://github.com/Sapphillon/Sapphillon_CLI.git
cd Sapphillon_CLI
```

### 2. Denoのインストール

Denoがインストールされていない場合は、以下のコマンドでインストールできます：

```bash
# macOS/Linux
curl -fsSL https://deno.land/install.sh | sh

# Windows (PowerShell)
irm https://deno.land/install.ps1 | iex

# または、Makefileを使用
make install
```

### 3. Dev Container を使用する（オプション）

VS CodeとDocker環境がある場合、Dev Containerを使用して開発環境を簡単にセットアップできます：

1. VS Codeで「Dev Containers」拡張機能をインストール
2. リポジトリを開く
3. コマンドパレット (Ctrl+Shift+P / Cmd+Shift+P) から「Dev Containers: Reopen in Container」を選択

Dev Containerには以下が含まれます：
- Deno最新版
- VS Code Deno拡張機能
- 自動的な設定

## 開発ワークフロー

### Make コマンド

プロジェクトには、よく使用するコマンドをまとめたMakefileが含まれています：

```bash
# 利用可能なコマンドを表示
make help

# CLIを実行
make run

# 開発モード（ファイル変更を監視して自動再起動）
make dev

# テストを実行
make test

# コードフォーマット
make fmt

# コードフォーマットのチェック（変更なし）
make fmt-check

# Linterを実行
make lint

# 一時ファイルをクリーンアップ
make clean
```

### Deno タスク

`deno.json`に定義されているタスクを直接実行することもできます：

```bash
# CLIを実行
deno task start

# 開発モード
deno task dev

# テストを実行
deno task test

# コードフォーマット
deno task fmt

# Linterを実行
deno task lint
```

## プロジェクト構造

```
Sapphillon_CLI/
├── .devcontainer/          # Dev Container設定
│   └── devcontainer.json
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
│       └── ci.yml
├── src/
│   ├── commands/           # CLIコマンドの実装
│   │   ├── greet.ts
│   │   └── greet_test.ts
│   └── version.ts          # バージョン情報
├── main.ts                 # CLIエントリーポイント
├── main_test.ts            # メインのテスト
├── deno.json               # Deno設定ファイル
├── Makefile                # Make タスク定義
├── .gitignore              # Git無視ファイル
└── README.md               # プロジェクト概要
```

## 新しいコマンドの追加

1. `src/commands/`ディレクトリに新しいコマンドファイルを作成：

```typescript
// src/commands/mycommand.ts
export async function myCommand(options: string): Promise<void> {
  console.log(`Executing my command with: ${options}`);
}
```

2. テストファイルを作成：

```typescript
// src/commands/mycommand_test.ts
import { assertEquals } from "jsr:@std/assert";
import { myCommand } from "./mycommand.ts";

Deno.test("myCommand executes without error", async () => {
  await myCommand("test");
  assertEquals(true, true);
});
```

3. `main.ts`にコマンドを登録：

```typescript
import { myCommand } from "./src/commands/mycommand.ts";

// switchステートメント内に追加
case "mycommand":
  await myCommand(args.option);
  break;
```

## テスト

### テストの実行

```bash
# すべてのテストを実行
make test

# または
deno task test

# 特定のテストファイルを実行
deno test src/commands/greet_test.ts
```

### テストの書き方

- ファイル名は `*_test.ts` パターンを使用
- `jsr:@std/assert` からアサーション関数をインポート
- `Deno.test()` を使用してテストを定義

## コード品質

### フォーマット

```bash
# コードを自動フォーマット
make fmt

# フォーマットをチェック（変更なし）
make fmt-check
```

フォーマット設定は`deno.json`で設定されています：
- 2スペースインデント
- セミコロン使用
- ダブルクォート
- 行幅100文字

### Lint

```bash
# Linterを実行
make lint
```

Denoの組み込みLinterが、一般的な問題やアンチパターンをチェックします。

## CI/CD

GitHub Actionsを使用して、以下を自動的に実行します：

- **テスト**: すべてのテストを実行
- **フォーマットチェック**: コードスタイルを検証
- **Lint**: コード品質をチェック
- **ビルド検証**: CLIが正常に実行できることを確認

プルリクエストまたはmain/developブランチへのプッシュ時に自動実行されます。

## CLIの実行

### 開発中

```bash
# ヘルプを表示
deno run --allow-read --allow-write --allow-net main.ts --help

# バージョンを表示
deno run --allow-read --allow-write --allow-net main.ts --version

# greetコマンドを実行
deno run --allow-read --allow-write --allow-net main.ts greet --name Alice
```

### Makeを使用

```bash
# 引数を渡す
make run ARGS="greet --name Alice"
make run ARGS="--version"
```

## パーミッション

Denoはセキュアバイデフォルトです。以下のパーミッションを使用しています：

- `--allow-read`: ファイルシステムの読み取り
- `--allow-write`: ファイルシステムの書き込み
- `--allow-net`: ネットワークアクセス

必要に応じて、より細かい制御のためにパーミッションを調整できます。

## トラブルシューティング

### Denoコマンドが見つからない

Denoがインストールされているか確認し、PATHに追加されているか確認してください：

```bash
# Denoのバージョンを確認
deno --version

# PATHに追加（~/.bashrc または ~/.zshrc に追加）
export PATH="$HOME/.deno/bin:$PATH"
```

### テストが失敗する

1. すべての依存関係が最新であることを確認
2. `deno cache main.ts` でキャッシュをリフレッシュ
3. パーミッションエラーの場合、必要なフラグを追加

### フォーマットの問題

```bash
# 自動修正
make fmt

# または手動でチェック
deno fmt --check
```

## リソース

- [Deno公式ドキュメント](https://deno.land/manual)
- [Deno標準ライブラリ](https://deno.land/std)
- [JSR（JavaScript Registry）](https://jsr.io/)

## コントリビューション

1. 新しいブランチを作成: `git checkout -b feature/my-feature`
2. 変更を加える
3. テストを実行: `make test`
4. フォーマットとLint: `make fmt && make lint`
5. コミット: `git commit -am 'Add new feature'`
6. プッシュ: `git push origin feature/my-feature`
7. プルリクエストを作成

すべてのプルリクエストはCIチェックをパスする必要があります。
