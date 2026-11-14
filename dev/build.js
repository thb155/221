// 资本帝国实验室 · 构建脚本
//       node build.js --web  → 额外生成 web/（上传到 GitHub Pages 的网站版，支持离线和添加到主屏幕）
// 用法：node build.js        → 生成 dist/资本帝国实验室.html（单文件，可直接双击打开）
//       node build.js --test → 额外生成 dist/自检.html（打开后自动运行自动化测试）
const fs = require('fs'), path = require('path');
const root = __dirname, src = path.join(root, 'src');
const order = fs.readFileSync(path.join(src, 'js', 'order.txt'), 'utf8').split(/\r?\n/).filter(Boolean);
const js = order.map(f => fs.readFileSync(path.join(src, 'js', f), 'utf8')).join('');
const shell = fs.readFileSync(path.join(src, 'shell.html'), 'utf8');
if (!shell.includes('/*@@SCRIPT@@*/')) throw new Error('shell.html 缺少 /*@@SCRIPT@@*/ 占位符');
const out = shell.replace('/*@@SCRIPT@@*/', () => js);
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist', '资本帝国实验室.html'), out);
console.log(`✅ 已生成 dist/资本帝国实验室.html  (${order.length} 个模块, ${(out.length / 1024).toFixed(0)} KB)`);
if (process.argv.includes('--test')) {
  const t = fs.readFileSync(path.join(root, 'tests', 'selftest.js'), 'utf8');
  fs.writeFileSync(path.join(root, 'dist', '自检.html'), out.replace('</body>', () => `<script>\n${t}\n</script>\n</body>`));
  console.log('✅ 已生成 dist/自检.html（用浏览器打开即自动测试）');
}

if (process.argv.includes('--web')) {
  const wi = process.argv.indexOf('--web-out'); const web = wi > 0 ? path.resolve(process.argv[wi + 1]) : path.join(root, 'web');
  for (const f of ['sw.js', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png']) { const from = path.join(root, 'web', f), to = path.join(web, f); if (from !== to && fs.existsSync(from)) fs.copyFileSync(from, to); }
  const ver = Date.now().toString(36);
  const head = `<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-180.png">\n<link rel="icon" href="icon.svg" type="image/svg+xml">`;
  const reg = `<script>if('serviceWorker' in navigator&&location.protocol.startsWith('http')){addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').then(r=>{r.addEventListener('updatefound',()=>{const w=r.installing;w&&w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller){try{toast('🆕 游戏已更新，下次打开生效')}catch(e){}}})})}).catch(()=>{})})}</script>`;
  let page = out.replace('</head>', () => head + '\n</head>').replace('</body>', () => reg + '\n</body>');
  fs.writeFileSync(path.join(web, 'index.html'), page);
  const sw = fs.readFileSync(path.join(web, 'sw.js'), 'utf8').replace(/const VERSION = '[^']*';/, `const VERSION = '${ver}';`);
  fs.writeFileSync(path.join(web, 'sw.js'), sw);
  fs.writeFileSync(path.join(web, '.nojekyll'), '');
  console.log(`✅ 已生成 web/index.html（网站版，版本 ${ver}）—— 把 web 文件夹里的全部文件上传到 GitHub 仓库即可`);
}
