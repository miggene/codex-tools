---
name: git-commit-generator
description: Generate git commit messages from current changes. Analyzes code modifications, allows user to select files to stage, then creates Conventional Commits format messages with body. User confirms before committing.
---

# Git Commit Generator

## Usage
- `/commit` - Stage files and generate commit message for current changes
- `/git-commit` - Same as above

## Workflow

### Step 1: 显示修改的文件
执行 `git status --porcelain` 或 `git diff --name-status` 显示所有修改的文件，包括：
- 已修改的文件 (M)
- 新增的文件 (A)
- 删除的文件 (D)
- 未跟踪的文件 (??)

### Step 2: 用户选择要 Stage 的文件
显示选项：
```
📁 修改的文件:

M  src/hooks/useCodexController.ts
M  src/components/AddAccountSection.tsx
A  src-tauri/src/account_service.rs
M  src-tauri/src/lib.rs
M  src/i18n/locales/en-US.json
...

请选择要 Stage 的文件:
[1] 全部文件 (推荐)
[2] 仅后端文件 (src-tauri/*)
[3] 仅前端文件 (src/*)
[4] 自定义选择...
```

用户选择后，执行对应的 `git add <files>`

### Step 3: 分析已 Staged 的变更
- 执行 `git diff --cached --stat` 获取 staged 文件
- 分析变更内容推断 type 和 scope

### Step 4: 生成 Commit 信息
使用 Conventional Commits 格式 + Body：

```
<type>(<scope>): <subject>

- <change 1>
- <change 2>
- <change 3>

Closes #xxx (optional)
```

### Step 5: 用户确认 Commit 信息
显示生成的 commit 信息，询问用户：

```
📝 生成的 Commit 信息:

feat(components): add export/import accounts functionality

- Add export_accounts command in backend
- Add exportAllAccounts and importAccountsBundle in frontend
- Add export/import buttons in AddAccountSection
- Add i18n strings for 6 languages
- Add dialog and fs plugins

请确认:
[1] ✅ 确认提交
[2] 🔄 重新生成
[3] ✏️ 自定义信息
```

### Step 6: 执行 Commit
- 用户确认后执行 `git commit -m "..."`
- **注意：不提供 git push 功能，由用户自行执行**

## Type 检测规则
根据文件路径和变更内容自动推断：
- `src/components/*`, `src/pages/*` → `feat`
- `src/hooks/*`, `src/utils/*` → `feat` 或 `refactor`
- `src/types/*`, `src/i18n/*` → `feat`
- `fix`, `bugfix`, `hotfix` → `fix`
- `README.md`, `docs/*` → `docs`
- `src/**/*.test.ts`, `src/**/*.spec.ts` → `test`
- `package.json`, `Cargo.toml`, `*.config.*` → `chore`

## Scope 检测规则
根据文件目录自动推断：
- `src/components/` → `components`
- `src/hooks/` → `hooks`
- `src/utils/` → `utils`
- `src/types/` → `types`
- `src/i18n/` → `i18n`
- `src-tauri/src/` → `backend`
- `src-tauri/Cargo.toml` → `cargo`
- 根目录配置文件 → `config`

## 错误处理
- 无变更时提示："没有检测到代码变更"
- git 未初始化时提示："当前目录不是 Git 仓库"
- add 失败时提示错误信息并允许重试
