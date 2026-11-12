# 台灣蛙類 LLM Wiki

用 LLM 持續維護的台灣蛙類知識庫,並以網頁呈現。

- 規則檔:[AGENTS.md](AGENTS.md)(AI 協作者請先讀這份)
- 原始資料:`raw/`(唯讀)
- Wiki:`wiki/`(AI 維護的 Markdown)
- 網站入口:`index.html`

## 本機預覽

每次修改 `wiki/` 後,先打包一次:

```bash
python3 assets/build.py
```

接著有兩種開法:

- 直接雙擊 `index.html`(讀的是 `assets/build.py` 產生的 `assets/wiki-data.js`,需要連網載入 Markdown 解析套件)。
- 用本機伺服器(會直接讀 `wiki/*.md`):

```bash
python3 -m http.server 8000
# 瀏覽器開啟 http://localhost:8000
```

## 發佈到 GitHub Pages

1. 上傳整個專案到 GitHub repository。
2. Settings → Pages → Branch 選 `main`,資料夾選 `/ (root)`。
3. 幾分鐘後即可在 `https://<帳號>.github.io/<repo 名稱>/` 瀏覽。

## 新增內容的方式

1. 把資料放進 `raw/`(文章、圖鑑文字、保育單位資料等)。
2. 對 AI 說:「請依 AGENTS.md 的 Ingest 流程處理 raw/ 裡的 XXX」。
3. 檢查 AI 更新的頁面,確認數字與名稱,再提交到 GitHub。
