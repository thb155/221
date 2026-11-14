# 可选：用 Playwright 无头浏览器自动跑自检（开发用）。  pip install playwright && playwright install chromium
import asyncio, pathlib, sys, json
from playwright.async_api import async_playwright
async def main():
    page_path = pathlib.Path(__file__).resolve().parent.parent / 'dist' / '自检.html'
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for dev in [None, 'iPhone 13']:
            ctx = await b.new_context(**(p.devices[dev] if dev else {'viewport': {'width': 1440, 'height': 900}}))
            pg = await ctx.new_page(); errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(page_path.as_uri())
            await pg.wait_for_function('window.__TEST_RESULT', timeout=180000)
            r = await pg.evaluate('window.__TEST_RESULT')
            print(f"[{dev or '桌面'}] {r['pass']}/{r['total']} 通过")
            for t in r['results']:
                if not t['ok']: print('  ❌', t['name'], t['msg'])
            if errs: print('  页面错误:', errs[:3])
            if r['pass'] != r['total'] or errs: sys.exit(1)
        await b.close()
asyncio.run(main())
