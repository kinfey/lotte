#  抽奖 (HTML5/TypeScript/CSS3)

一个纯前端的转盘抽奖应用：8等分、8种颜色；一等奖/二等奖/三等奖各1名，抽中后自动扣减名额，状态保存在浏览器 localStorage。现已使用 TypeScript 重写，提供更好的类型安全和开发体验。

## 使用

### 直接运行
直接双击打开 index.html 即可本地运行，或用任何静态服务器托管。

### 开发环境
如果你要修改 TypeScript 源码：

```bash
# 安装依赖
npm install

# 编译 TypeScript
npm run build

# 监听模式（自动编译）
npm run watch

# 启动开发服务器
npm run serve
```

- 开始抽奖：点击"开始抽奖"按钮
- 重置名额：点击"重置名额"恢复一/二/三等奖名额为 1
- 设备与适配：桌面端画布大小 520×520，移动端自动堆叠布局

## 规则

- 8 个扇区：一等奖、二等奖、三等奖各 1 个，其余为"谢谢参与"
- 每个大奖名额只有 1 个；抽完后继续抽到该奖时，判定为未中奖
- 名额状态保存在 localStorage（仅当前浏览器生效）

## 文件结构

### TypeScript 源码 (src/)
- `src/i18n.ts`：多语言管理，包含类型定义
- `src/script.ts`：转盘绘制、旋转动画与抽奖逻辑

### 编译输出 (dist/)
- `dist/i18n.js`：编译后的多语言模块
- `dist/script.js`：编译后的主逻辑
- `dist/*.d.ts`：TypeScript 类型声明文件

### 其他文件
- `index.html`：页面结构
- `style.css`：样式
- `package.json`：项目配置和依赖
- `tsconfig.json`：TypeScript 编译配置

## 开发提示

- 如需修改奖项或颜色，可编辑 `src/script.ts` 中的 `getPrizeSegments()` 函数
- 如需改变名额数量，修改 `prizeLimitsDefault` 常量
- 如需清空名额状态，可在浏览器开发者工具中清除 localStorage 键 `wheel-prize-limits-v1`
- 修改 TypeScript 源码后，需要运行 `npm run build` 重新编译

## 部署到 GitHub Pages

此仓库已包含自动部署到 GitHub Pages 的工作流（`.github/workflows/pages.yml`）。

使用步骤：
1. 确保默认分支为 `main`，并把代码推送到 GitHub。
2. 在 GitHub 仓库页面，依次进入 Settings → Pages：
   - Build and deployment 选择 "GitHub Actions"。
3. 每次 push 到 `main` 或在 Actions 手动触发，都会自动部署到 Pages。

访问地址：
- 部署完成后，可在 Actions 日志或 Settings → Pages 查看页面 URL（通常为 `https://<你的用户名>.github.io/<仓库名>/`）。