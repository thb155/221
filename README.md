# 资本帝国实验室 · Capital Empire Lab

一款受《资本主义实验室》启发的原创网页商业模拟游戏：零售、产业链、房地产、互联网、股市、商战、宏观经济……

## ▶️ 在线游玩
**https://thb155.github.io/221/**

- 电脑、手机（含 iPhone）浏览器直接打开即可
- iPhone：Safari 打开 → 分享 → 「添加到主屏幕」，之后像 App 一样全屏打开，断网也能玩
- 存档保存在各自浏览器里；可在 设置 → 存档 里导出/导入，在设备之间转移

## 🛠 开发
源码在 `dev/`，说明见 [dev/README.md](dev/README.md)。修改后运行：
```
node dev/build.js --test --web --web-out .
```
然后用浏览器打开 `dev/dist/自检.html` 跑自动化测试，全部通过后提交推送即可自动更新网站。
