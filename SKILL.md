---
name: git-commit-generator
description: Generate git commit messages from current changes. Analyzes code modifications, allows user to select files to stage, then creates Conventional Commits format messages with body. User confirms before committing. All commit messages should be in Chinese.
---

# Git Commit Generator

## Usage
- `/commit` - Stage files and generate commit message for current changes
- `/git-commit` - Same as above

## 重要：语言要求
**所有生成的 commit 信息必须使用中文**

## Workflow

### Step 1: 显示修改的文件
执行 `git status --porcelain` 或 `git diff --name-status` 显示所有修改的文件，包括：
- 已修改的文件 (M)
- 新增的文件 (A)
- 删除的文件 (D)
- 未跟踪的文件 (??)

### Step 2: 用户选择要 Stage 的文件
首先检查当前是否有已 staged 的文件：
```
git diff --cached --name-only
```
如果已有 staged 文件，询问用户是否：

**选项设计**（使用 `question` 工具的 `custom` 选项）：
```
请选择 Stage 方式:

[1] ☑️ 全部勾选 (Stage 所有变更)
[2] 仅新增文件 (Stage ?? 标记的文件)
[3] 仅修改文件 (Stage M 标记的文件)
[4] ⏭️ 跳过 (保持现有 staged 文件不变)
[5] 📋 查看当前 staged 状态
```

用户选择后，执行对应的 `git add <files>`

### Step 3: 分析已 Staged 的变更
- 执行 `git diff --cached --stat` 获取 staged 文件
- 执行 `git diff --cached` 获取具体变更内容
- 分析变更内容推断 type 和 scope

### Step 4: 生成 Commit 信息
使用 Conventional Commits 格式 + Body，**使用中文**：

```
<type>(<scope>): <subject>

- <change 1>
- <change 2>
- <change 3>

Closes #xxx (可选)
```

示例（中文）：
```
feat(accounts): 添加账号导出与导入功能

- 后端新增 export_accounts 命令
- 前端添加 exportAllAccounts 和 importAccountsBundle 函数
- 在账号页面添加导出/导入按钮
- 添加 6 种语言的国际化文案
- 添加 dialog 和 fs 插件依赖
```

### Step 5: 用户确认 Commit 信息
显示生成的 commit 信息，询问用户：

```
📝 生成的 Commit 信息:

feat(accounts): 添加账号导出与导入功能

- 后端新增 export_accounts 命令
- 前端添加 exportAllAccounts 和 importAccountsBundle 函数
- 在账号页面添加导出/导入按钮
- 添加 6 种语言的国际化文案
- 添加 dialog 和 fs 插件依赖

请确认:
[1] ✅ 确认提交
[2] 🔄 重新生成
[3] ✏️ 自定义信息 (手动输入)
[4] ❌ 取消
```

### Step 6: 执行 Commit
- 用户确认后执行 `git commit -m "..."`
- **注意：不提供 git push 功能，由用户自行执行**

## Type 检测规则
根据文件路径和变更内容自动推断：
- `src/components/*`, `src/pages/*` → `feat` (新功能)
- `src/hooks/*`, `src/utils/*` → `feat` 或 `refactor`
- `src/types/*`, `src/i18n/*` → `feat`
- `fix`, `bugfix`, `hotfix` → `fix` (修复)
- `README.md`, `docs/*` → `docs` (文档)
- `src/**/*.test.ts`, `src/**/*.spec.ts` → `test` (测试)
- `package.json`, `Cargo.toml`, `*.config.*` → `chore` (维护)

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
