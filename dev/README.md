# 资本帝国实验室 · 源码说明

## 怎么玩
直接双击 `资本帝国实验室.html`（上一级文件夹里）即可，不需要安装任何东西。

## 文件结构

```
源码/
├─ build.js              构建脚本：把 src 拼成一个单文件 HTML
├─ src/
│  ├─ shell.html         页面骨架 + 全部 CSS（脚本位置用 /*@@SCRIPT@@*/ 占位）
│  └─ js/                游戏逻辑，按 order.txt 的顺序拼接
│     ├─ order.txt               模块顺序
│     ├─ 00-data.js              商品、建筑、城市、对手、宏观事件、客群等全部配置数据
│     ├─ 01-state.js             公司/城市数据结构、开局 newGame、剧本
│     ├─ 02-land-realestate.js   地块、地价、人口密度、拆迁、建造、子公司记账
│     ├─ 03-simulation.js        每日模拟：生产、物流、分城市库存、零售（三类客群）、互联网、宏观、月结
│     ├─ 04-war-alliance.js      股权联盟、30%/51% 规则、商战
│     ├─ 05-inbox-decisions-diplomacy.js  通知中心、决策事件、互不侵犯条约、经营月报
│     ├─ 06-ai.js                对手 AI：定价、扩张、研发、建仓库
│     ├─ 07-goals.js             目标清单
│     ├─ 08-render.js            等距画面、缓存、车辆货车、昼夜四季、音效
│     ├─ 09-mainloop.js          主循环（帧率、游戏速度）
│     ├─ 10-input.js             鼠标/触屏/双指缩放、建造确认
│     ├─ 11-ui-panels.js         顶栏、建造菜单、建筑详情面板
│     ├─ 12-windows.js           所有弹窗：市场、财务报表、看板、商战、人才……
│     └─ 13-save-boot.js         存档读档、导入导出、开始界面
├─ web/                  网站版素材：sw.js（离线缓存）、manifest、图标
├─ tests/
│  ├─ selftest.js        浏览器内自动化测试（19 项）
│  └─ run_selftest.py    可选：用无头浏览器批量跑测试
└─ dist/                 构建产物
```

## 网站版（GitHub Pages）
- `node build.js --web` 生成 `web/` 文件夹：带离线缓存和主屏幕图标的网站版
- 在 GitHub 仓库里运行 `node dev/build.js --web --web-out .` 会直接更新仓库根目录的网站文件

## 修改与构建
1. 安装 Node.js（https://nodejs.org ，ARM64 版 Windows 也有官方安装包）
2. 修改 `src/` 里的文件
3. 在 `源码` 文件夹里运行：
   ```
   node build.js --test
   ```
4. 打开 `dist/自检.html` → 自动运行测试，全部 ✅ 再用 `dist/资本帝国实验室.html`

## 调数值
大部分平衡参数集中在 `00-data.js`：
- `P` 商品（进口价 imp、参考价 ref、配方 inp、产能 rate、需求 dem）
- `BT` 建筑（造价 cost、日运营成本 op）
- `CITY_DEF` 城市（初始规模、地价倍数、增长率、客群比例 seg）
- `AI_DEF` 对手（定价风格 price、研发倾向 tech、扩张 exp、偏好 w）
- `MACRO` 宏观事件（月概率 p、持续月数 dur）
