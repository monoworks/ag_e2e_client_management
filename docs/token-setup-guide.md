# GitHub Token 発行・設定ガイド

本システムはデータの保存に GitHub API を使用しているため、利用者ごとに Personal Access Token の発行が必要です。

## 前提条件

- GitHub アカウントを持っていること（[無料で作成可能](https://github.com/signup)）
- リポジトリ管理者から Collaborator として招待されていること

---

## Step 1: トークン発行ページを開く

以下のURLにアクセスしてください（GitHub にログイン済みであること）：

👉 **https://github.com/settings/personal-access-tokens/new**

---

## Step 2: 基本情報を入力

| 項目 | 入力内容 |
|---|---|
| **Token name** | 任意の名前（例: `CRM-App`） |
| **Expiration** | 有効期限を選択（推奨: 90 days） |
| **Description** | 任意（例: クライアント管理システム用） |

---

## Step 3: Repository access を設定

1. **「Only select repositories」** を選択
2. ドロップダウンから **`monoworks/ag_e2e_client_management`** を選択

---

## Step 4: Permissions を設定

1. **「+ Add permissions」** ボタンをクリック
2. **「Contents」** を探して **「Read and write」** を選択

> ⚠️ Metadata: Read は自動で付与されます

---

## Step 5: トークンを生成

1. ページ下部の **「Generate token」** をクリック
2. 表示されたトークン（`github_pat_...`）を**必ずコピー**してください

> ⚠️ トークンは一度しか表示されません。紛失した場合は再発行が必要です。

---

## Step 6: アプリに設定

1. アプリを開く → **https://monoworks.github.io/ag_e2e_client_management/**
2. 「**設定画面へ**」ボタンをクリック（または左メニューの ⚙️ 設定）
3. 以下の情報を入力：

| フィールド | 入力する値 |
|---|---|
| **Personal Access Token** | コピーしたトークン |
| **オーナー** | `monoworks` |
| **リポジトリ名** | `ag_e2e_client_management` |
| **ブランチ** | `main` |

4. **「💾 設定を保存」** をクリック
5. **「🔗 接続テスト」** で接続成功を確認

---

## トラブルシューティング

| 症状 | 原因と対処 |
|---|---|
| 403 エラー | トークンの Contents 権限が不足 → Step 4 を再確認 |
| 404 エラー | オーナー名またはリポジトリ名の入力ミス → Step 6 を再確認 |
| 接続テスト失敗 | トークンの有効期限切れ → 再発行してください |

---

## セキュリティに関する注意

- トークンは **パスワードと同じ**です。他人と共有しないでください
- 各メンバーが **自分のアカウントでトークンを発行** してください
- トークンはブラウザの localStorage に保存されます（サーバーには送信されません）
- 不要になったトークンは [GitHub Settings](https://github.com/settings/tokens?type=beta) から削除してください
