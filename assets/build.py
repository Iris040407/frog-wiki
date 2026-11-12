#!/usr/bin/env python3
"""把 wiki/ 底下所有 .md 打包成 wiki-data.js,讓 index.html 在直接雙擊開啟(file://)時也能顯示。

用法:在專案根目錄執行  python3 assets/build.py
wiki 內容有任何更動後都要重新執行一次。
"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent   # assets/
root = here.parent                       # 專案根目錄
wiki = root / "wiki"

pages = {}
for p in sorted(wiki.rglob("*.md")):
    name = p.relative_to(wiki).with_suffix("").as_posix()
    pages[name] = p.read_text(encoding="utf-8")

out = here / "wiki-data.js"
out.write_text(
    "// 由 build.py 自動產生,請勿手動編輯\n"
    "window.WIKI = " + json.dumps(pages, ensure_ascii=False, indent=1) + ";\n",
    encoding="utf-8",
)
print(f"已打包 {len(pages)} 個頁面 -> {out.name}")
