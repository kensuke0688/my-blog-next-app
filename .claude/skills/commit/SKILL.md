---
name: commit
description: 現在の変更を、わかりやすいメッセージでコミットする
disable-model-invocation: true
allowed-tools: Bash(git add:*), Bash(git commit:*), Bash(git status:*)
---

# Commit Skill

## 手順
1. `git status` で現状を確認する
2. ステージされていなければ `git add .`
3. 変更内容を1〜2文でまとめたコミットメッセージを作る
4. `git commit -m "<message>"` を実行する

## メッセージ形式
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- refactor: リファクタ