# 操作紀錄

> 只能在結尾追加,不可改寫舊紀錄。格式:`## [YYYY-MM-DD] 類型 | 標題`

## [2026-11-09] setup | 建立專案骨架(主題:台灣蛙類)
- 建立 AGENTS.md、wiki/index.md、wiki/log.md、wiki/overview.md、wiki/concepts/蛙類辨識方法.md、index.html、README.md、raw/ 目錄

## [2026-11-09] ingest | 五份台灣蛙類來源
- raw:5 份筆記(FrogsWorld 三份、台南社大、自然科學博物館)
- 新增來源摘要:sources/ 5 頁
- 新增物種頁:拉都西氏赤蛙、澤樹蛙、褐樹蛙、斯文豪氏赤蛙、諸羅樹蛙、台北樹蛙
- 新增概念頁:繁殖季節比較
- 更新:overview、蛙類辨識方法、index
- 備註:黑眶蟾蜍是蟾蜍,暫不建頁;物種總數、科別、保育等級沒有可靠來源,已標待查證

## [2026-11-09] style | 清新手帳綠色風格與蛙類卡牌模式升級
- 更新 assets/style.css: 建置清新手帳風格系統(點點桌面底紋、自然綠色系色票、手撕和紙膠帶、待查證黃色便利貼、圓角卡片陰影)
- 更新 assets/app.js: 實作蛙類手帳卡牌羅列網格(支援科別/特有種/保育類即時篩選)、物種獨立手帳觀察頁(6宮格基本資料卡、辨識特徵與生態觀察雙欄)、目錄手帳索引籤
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-11] feature | 增加青蛙視覺元素與持續更新中的觀察筆記格
- 更新 index.html: 封面增加趴趴手帳探頭青蛙 (Peeking Frog)
- 更新 assets/style.css: 實作探頭蛙微動效、青蛙足跡分隔線、持續更新筆記格樣式(方格信紙底紋、呼吸指示燈、活頁分頁、隨手便籤輸入框)
- 更新 assets/app.js: 為 6 種蛙類繪製專屬外觀特徵生態圖徽(台北樹蛙、諸羅樹蛙白線、褐樹蛙三角斑、斯文豪氏赤蛙鳥鳴、拉都西氏赤蛙背側褶、澤樹蛙VW斑與鳴囊); 實作「持續更新中的觀察筆記格」(含知識庫最新動態、進行中待查清單、本機 localStorage 自動儲存隨手觀察便籤)
- 更新 wiki/overview.md 與 wiki/index.md: 新增持續更新手記章節
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-11] ux | 強化「持續連載更新中」顯著視覺看板與籌備卡牌
- 更新 assets/app.js: 實作頂部「手帳連載進度看板 (Live Progress Banner)」(含呼吸光暈標籤、6/36 種蛙類擴充進度條與行進小青蛙、即時數據膠囊與連載速報); 卡牌網格新增莫氏樹蛙、面天樹蛙「調查籌備中」預告卡牌; 側邊欄增加連載中狀態
- 更新 assets/style.css: 實作連載進度條樣式、調查中標籤、籌備卡牌虛線樣式、即時跑馬燈與呼吸發光徽章
- 更新 wiki/overview.md: 明確標註 6/36 種收錄進度與下一階段預計收錄物種
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-11] ingest | 諸羅樹蛙資料更新 (林業署嘉義分署、教育百科)
- raw: 匯入 2 份原始資料 (raw/2026-11-11_林業署嘉義分署-諸羅樹蛙.md、raw/2026-11-11_教育百科-諸羅樹蛙.md)
- 新增來源摘要: wiki/sources/林業署嘉義分署-諸羅樹蛙.md、wiki/sources/教育百科-諸羅樹蛙.md
- 更新物種頁: wiki/species/諸羅樹蛙.md (更新新分類地位張樹蛙屬 Zhangixalus arvalis、確認樹蛙科、俗名雨怪與青蛭、雲嘉南 3 縣市 10 行政區詳細分布、全台現存約 2 萬隻、繁殖抱接與排卵 400 顆泡沫卵泡、金色魚叉紋蝌蚪與 28 天變態登陸、竹林棲地縮減 189.9 公頃與斑腿樹蛙/亞洲錦蛙入侵威脅; 依使用者要求在各段筆記下方明確標註資料來源出處，並設有獨立資料來源標註專區)
- 更新概念頁: wiki/concepts/繁殖季節比較.md (補齊諸羅樹蛙繁殖期 4–9 月、5–9 月與 3–10 月等各來源對照與 400 顆卵泡)、wiki/concepts/蛙類辨識方法.md (補充體側白線、鳴囊橘黃、金色魚叉紋蝌蚪與連串滴滴滴蟲鳴等線索)
- 更新總覽與索引: wiki/overview.md、wiki/index.md (加入新來源連結與手帳更新手記)
- 更新網站呈現: assets/app.js 與 assets/style.css (在物種獨立手帳頁加入專屬「資料來源標註」卡片與生態習性危機區塊渲染)
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-11] media | 增設 6 種蛙類真實生態寫真照片與來源標註
- assets/images: 下載並典藏 6 張台灣蛙類真實照片 (zhangixalus-arvalis-01.png、zhangixalus-taipeianus-01.png、buergeria-robusta-01.png、odorrana-swinhoana-01.png、rana-latouchii-01.png、fejervarya-multistriata-01.png)
- 更新物種頁: wiki/species/ 6 篇物種頁全面在 Frontmatter 與正文中加入生態照片，並於每張照片下方清楚備註來源 (TaiCoL 台灣物種名錄、iNaturalist Taiwan、Wikimedia Commons、Flickr) 與創用 CC 授權方式
- 更新網站呈現: assets/app.js 與 assets/style.css 實作卡牌真實照片頭像與物種頁「手帳拍立得寫真框 (Polaroid Frame)」，每張照片下方均有專屬圖說與授權膠囊
- 更新總覽: wiki/overview.md (登錄生態寫真最新進度)
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-11] ingest | 諸羅樹蛙法定保育等級核實 (台灣兩棲類數位典藏)
- raw: 匯入 raw/2026-11-11_台灣兩棲類數位典藏-諸羅樹蛙.md (Froghome 元資料庫)
- 新增來源摘要: wiki/sources/台灣兩棲類數位典藏-諸羅樹蛙.md
- 更新物種頁: wiki/species/諸羅樹蛙.md (更新法定保育等級為農委會/農業部保育類第 II 級珍貴稀有野生動物、IUCN 紅皮書指標 EN 瀕危; 補充量化聲學物理數據; 將待查證中之保育等級項目核實結案; 於資料來源標註專區增列來源)
- 更新概念頁: wiki/concepts/蛙類辨識方法.md (補充叫聲間隔 2.4 秒與主頻 2457 Hz 量化特徵)
- 更新總覽與索引: wiki/overview.md、wiki/index.md (登錄第 8 份典藏來源)
- 更新網站呈現: assets/app.js (更新手帳連載看板數據為 8 份來源、速報跑馬燈與最新動態時間軸)
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-11] ingest | 拉都希氏赤蛙正名與資料更新 (Froghome、TEIA、教育百科)
- raw: 匯入 3 份原始資料 (raw/2026-11-11_台灣兩棲類數位典藏-拉都希氏赤蛙.md、raw/2026-11-11_台灣環境資訊協會-拉都希氏赤蛙.md、raw/2026-11-11_教育百科-拉都希氏赤蛙.md)
- 新增來源摘要: wiki/sources/台灣兩棲類數位典藏-拉都希氏赤蛙.md、wiki/sources/台灣環境資訊協會-拉都希氏赤蛙.md、wiki/sources/教育百科-拉都希氏赤蛙.md
- 更新來源摘要: wiki/sources/FrogsWorld-拉都西氏赤蛙.md (更新指向與更名註記)
- 更名與更新物種頁: wiki/species/拉都希氏赤蛙.md (更正檔名與中文標準名為「拉都希氏赤蛙」; 確認赤蛙科 Ranidae、學名 Hylarana latouchii; 補充 La Touche 命名歷史、白色頷腺、雄蛙粗壯前臂構造、相親大會集體求偶、每次產 350–450 粒黏性長條卵塊與聲學物理測量數據; 核實為一般類非保育野生動物 IUCN LC; 移除舊檔 wiki/species/拉都西氏赤蛙.md)
- 更新概念頁: wiki/concepts/繁殖季節比較.md、wiki/concepts/蛙類辨識方法.md (更新物種名稱、黏性卵與鑑別特徵)
- 更新總覽與索引: wiki/overview.md、wiki/index.md (登錄 11 份來源與拉都希氏赤蛙連結)
- 更新網站呈現: assets/app.js (更正預設物種清單鍵值、圖徽檢索、手帳動態速報與任務清單)
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-11] ingest | 台北樹蛙資料與法定保育等級更新 (Froghome、臺北市生物多樣性資料庫)
- raw: 匯入 raw/2026-11-11_台北市生物多樣性資訊網-台北樹蛙.md、raw/2026-11-11_台灣兩棲類數位典藏-台北樹蛙.md
- 新增來源摘要: wiki/sources/台北市生物多樣性資訊網-台北樹蛙.md、wiki/sources/台灣兩棲類數位典藏-台北樹蛙.md
- 更新物種頁: wiki/species/台北樹蛙.md (更新新分類地位 Zhangixalus taipeianus (Liang & Wang, 1978)、確認體長 4–6 cm、虹膜金黃色與大腿內側黑斑、梁潤生與王慶讓教授於 1978 年發表為台灣第一種由本地學者自行發現命名之蛙種歷史里程碑、泥洞鳴叫求偶與弱勢雄蛙替代交配策略、聲學物理量化數據; 核實法定保育等級為農委會/農業部第 III 級其他應予保育野生動物、IUCN NT 近危; 增設獨立詳細資料來源標註專區; 將待查證項目核實結案)
- 更新概念頁: wiki/concepts/繁殖季節比較.md (補充泥洞產卵、白色泡沫卵塊 300–400 粒與暫時儲水生態)、wiki/concepts/蛙類辨識方法.md (補充金黃虹膜鑑別莫氏樹蛙、體側無白線鑑別諸羅樹蛙、多音節鳴叫與聲學數據)
- 更新總覽與索引: wiki/overview.md、wiki/index.md (登錄 13 份典藏來源)
- 更新網站呈現: assets/app.js (更新手帳連載進度看板來源數為 13 份、連載速報跑馬燈、手帳最新動態時間軸與已完成任務核實)
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-11] ingest | 褐樹蛙資料與法定保育等級更新 (Froghome、青蛙學堂)
- raw: 匯入 raw/2026-11-11_台灣兩棲類數位典藏-褐樹蛙.md、raw/2026-11-11_青蛙學堂-褐樹蛙.md
- 新增來源摘要: wiki/sources/台灣兩棲類數位典藏-褐樹蛙.md、wiki/sources/青蛙學堂-褐樹蛙.md
- 更新物種頁: wiki/species/褐樹蛙.md (更新新分類地位樹蛙科溪樹蛙屬 Buergeria robusta (Boulenger, 1909)、確認體長 5–9 cm、雄 4–5 cm 與雌 6–7 cm 雌雄懸殊體型、吻端淺色與背部深色雙對稱三角斑、T 字形銀白與褐色雙色虹膜、上下唇黑白橫紋與白頷樹蛙鑑別、白天淺灰白至繁殖期金黃體色變化、春夏夜間溪流大遷徙與雌蛙交互踢腿產卵行為; 核實法定保育等級歷史為曾列為保育類、2008 年因族群量穩定降為一般類非保育野生動物、IUCN LC 無危; 收錄 6690 Hz 溪流適應性高頻聲學物理數據; 增設獨立詳細資料來源標註專區; 將待查證項目核實結案)
- 更新概念頁: wiki/concepts/繁殖季節比較.md (更新春夏 5–8 月溪流大遷徙、雌蛙交互踢腿產卵、300–400 粒卵分離黏石底成堆、底棲吸石蝌蚪)、wiki/concepts/蛙類辨識方法.md (補充雙對稱三角斑、T字雙色虹膜、上下唇黑白橫紋鑑別白頷樹蛙、體色金黃適應與 6690 Hz 極高頻叫聲)
- 更新總覽與索引: wiki/overview.md、wiki/index.md (登錄 15 份典藏來源)
- 更新網站呈現: assets/app.js (更新手帳連載進度看板來源數為 15 份、連載速報跑馬燈、手帳最新動態時間軸與已完成任務核實)
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-11] ingest | 斯文豪氏赤蛙資料與法定保育等級更新 (Froghome、青蛙學堂、教育百科)
- raw: 匯入 raw/2026-11-11_台灣兩棲類數位典藏-斯文豪氏赤蛙.md、raw/2026-11-11_青蛙學堂-斯文豪氏赤蛙.md、raw/2026-11-11_教育百科-斯文豪氏赤蛙.md
- 新增來源摘要: wiki/sources/台灣兩棲類數位典藏-斯文豪氏赤蛙.md、wiki/sources/青蛙學堂-斯文豪氏赤蛙.md、wiki/sources/教育百科-斯文豪氏赤蛙.md
- 更新物種頁: wiki/species/斯文豪氏赤蛙.md (更新新分類地位赤蛙科臭蛙屬 Odorrana swinhoana (Boulenger, 1903)、確認體長 6–10 cm、雄 6–7 cm 與雌 8 cm、多變擬態背色、指趾端吸盤與後肢全蹼、斷續顆粒背側褶、上唇白色與白色頷腺、眼鼻線黑色縱斑、一對咽側下外鳴囊與較勁合唱; 記載史溫侯 Robert Swinhoe 命名歷史紀念; 核實法定保育等級為一般類非保育野生動物、IUCN LC 無危; 收錄 0.154 秒鳥鳴「啾」聲學物理數據; 記錄淺水石底小堆產大型白卵 40–50 顆、綠豆芽期胚胎與腹側吸盤黑長尾蝌蚪; 增設獨立詳細資料來源標註專區; 將待查證項目核實結案)
- 更新概念頁: wiki/concepts/繁殖季節比較.md (更新 2–10 月繁殖期、產 40–50 顆大型白卵成小堆、綠豆芽胚胎與長尾蝌蚪)、wiki/concepts/蛙類辨識方法.md (補充鳥鳴單音「啾」、0.154 秒聲學爆發、斷續背側褶、吸盤全蹼與綠豆芽胚胎)
- 更新總覽與索引: wiki/overview.md、wiki/index.md (登錄 18 份典藏來源)
- 更新網站呈現: assets/app.js (更新手帳連載進度看板來源數為 18 份、連載速報跑馬燈、手帳最新動態時間軸與待查任務清單)
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-11] style | 各區塊內容高度限制與手帳清爽滾輪滑動升級
- 更新 assets/style.css:
  - 限制各卡片與內容區塊之最大高度：辨識特徵盒 (max-height: 280px)、鳴叫觀察與生活史札記 (max-height: 260px)、生態危機盒 (max-height: 260px)、資料來源標註盒 (max-height: 260px)、時間軸動態清單 (max-height: 330px)、待查清單 (max-height: 330px)、便利貼待查事項 (max-height: 200px)、引言與程式碼區塊。
  - 設計手帳客製化滑動滾輪規範：鼠尾草綠薄型滾輪、半透明薄荷軌道、圓角滑塊、微動效與 Firefox / WebKit 雙規格適配。
  - 實作手帳表格滾動容器 (.table-scroll-wrap)：表格過長時具水平與垂直滑動滾輪、標頭置頂固定 (sticky header)。
  - 新增可滑動貼紙標示 (.scroll-badge-indicator)。
- 更新 assets/app.js:
  - 各物種手帳卡片標題加入「📜 可滑動滾輪」提示標籤。
  - 將所有 Markdown 表格自動包覆進 .table-scroll-wrap 滾動容器中。
- 執行 python assets/build.py 重新產生 assets/wiki-data.js



## [2026-11-11] ingest | 澤蛙正名與資料全面更新 (Froghome、青蛙學堂、青蛙小站、TEIA)
- raw: 匯入 4 份原始資料 (raw/2026-11-11_台灣兩棲類數位典藏-澤蛙.md、raw/2026-11-11_青蛙學堂-澤蛙.md、raw/2026-11-11_青蛙小站-澤蛙.md、raw/2026-11-11_台灣環境資訊協會-澤蛙.md)
- 新增來源摘要: wiki/sources/台灣兩棲類數位典藏-澤蛙.md、wiki/sources/青蛙學堂-澤蛙.md、wiki/sources/青蛙小站-澤蛙.md、wiki/sources/台灣環境資訊協會-澤蛙.md
- 更新來源摘要: wiki/sources/FrogsWorld-澤樹蛙.md (標註更名與正名歷史)
- 正名與新增物種頁: wiki/species/澤蛙.md (自早期「澤樹蛙」正式正名為「澤蛙」; 確認叉舌蛙科 Dicroglossidae 陸蛙屬 Fejervarya limnocharis (Gravenhorst, 1829); 確認體長 4–6 cm、上下唇 3–4 條深色縱斑「紋面青蛙」、兩眼中間深色 V 斑、肩胛 W 斑、棒狀分散膚褶、背中線多態型; 核實法定保育等級為一般類非保育野生動物、IUCN LC 無危; 收錄 0.026 秒超短間隔「嘓嘓-」連續較勁對唱聲學數據; 記錄 3–10 月繁殖期、產 700–1600 粒浮膜狀卵塊、成蛙單日捕食多達 270 隻昆蟲之農田益蟲角色; 增設獨立詳細資料來源標註專區; 將待查證項目核實結案; 移除舊檔 wiki/species/澤樹蛙.md)
- 更新概念頁: wiki/concepts/繁殖季節比較.md (更新 3–10 月繁殖期、單年多次產卵、產 700–1600 粒浮膜狀卵、首波 6 種蛙類繁殖數據全數核實結案)、wiki/concepts/蛙類辨識方法.md (補充紋面唇紋、兩眼 V 斑、肩胛 W 斑、棒狀膚褶、背中線多樣性、單咽下內鳴囊與 0.026 秒「嘓嘓-」叫聲)
- 更新總覽與索引: wiki/overview.md、wiki/index.md (登錄 22 份典藏來源、更新物種列表與連結、核實結案第一階段首波 6 種蛙類)
- 更新網站呈現: assets/app.js、assets/style.css (更正預設排序鍵值為 species/澤蛙、擴充叉舌蛙科篩選標籤與樣式、圖徽支援澤蛙、更新手帳看板來源數為 22 份、更新連載速報跑馬燈、手帳最新動態時間軸、待查任務清單顯示 0 項待查並標記首波 6 種全數完備)
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-11] update | 依照使用者提供資料順序重新排列物種卡牌與目錄
- 調整順序為：1. 諸羅樹蛙、2. 台北樹蛙、3. 褐樹蛙、4. 斯文豪氏赤蛙、5. 拉都希氏赤蛙、6. 澤蛙。
- 更新 assets/app.js:
  - 調整 defaultOrder 順序，首波卡牌編號對齊 No.01 諸羅樹蛙、No.02 台北樹蛙、No.03 褐樹蛙、No.04 斯文豪氏赤蛙、No.05 拉都希氏赤蛙、No.06 澤蛙。
  - 同步調整連載手帳任務格「已完成」項目順序。
- 更新 wiki/overview.md: 將內文物種表格與待查證清單依 1 至 6 順序重新排序。
- 更新 wiki/index.md: 將 ## 物種 條目依 1 至 6 順序重新排序。
- 更新 wiki/concepts/繁殖季節比較.md: 將表格與相關頁面連結依 1 至 6 順序重新排序。
- 更新 wiki/concepts/蛙類辨識方法.md: 將相關頁面連結依 1 至 6 順序重新排序。
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-12] feature | 建立全台36種蛙類名錄專題與網頁打勾清單
- 新增概念頁: wiki/concepts/台灣36種蛙類名錄.md (依據《台灣蛙類與蝌蚪圖鑑》與台灣兩棲類動物保育網，收錄 6 科 36 種完整名錄、15 種特有種、保育等級、外來種與收錄進度核取清單)
- 更新總覽與索引: wiki/overview.md、wiki/index.md (登錄台灣36種蛙類名錄概念頁，更新待查證為已確立全台 36 種名錄架構)
- 更新網站呈現: assets/app.js、assets/style.css:
  - 網頁總覽頁實作「全台 36 種蛙類收錄打勾清單（Field Collection Checklist）」專區，提供 6 大科與特有種/保育類即時標籤篩選、已收錄 6 種直覺打勾標章、No.01～No.06 郵戳與手帳跳轉連結。
  - 連載手帳筆記格新增第 4 分頁「📋 全台 36 種打勾清單 (6/36)」，依科別統計收錄進度。
  - 頂部連載看板與進度條支援點擊一鍵滑動至 36 種名錄清單。
  - 側邊欄導覽自動收錄「台灣36種蛙類名錄」專題頁。
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-12] style | 簡約微型浮水印標示調整 (純英數無中文，低調不突兀)
- 更新 index.html:
  - 網頁最前方 (header.cover): 調整為極簡微型單行純英文標記 (.watermark-tag.top-watermark)，文字為「CYUT · 11514611 · CHANG, PAI-HUI」，字體小巧低調且無任何中文字樣。
  - 網頁最後方 (footer): 改為極簡乾淨的單行頁尾 (.site-footer .footer-meta)，僅顯示「CYUT · 11514611 · CHANG, PAI-HUI」，移除大卡片與中文裝飾。
  - 右下角懸浮浮水印 (.watermark-float): 改為低透明度（32%）、無底色邊框之純英數微型文字。
- 更新 assets/style.css: 移除大型卡牌與印章樣式，改用極簡、無襯線、低彩度之灰綠微型字體樣式。
- 更新 wiki/overview.md: 還原總覽內文為簡潔繁體中文客觀語氣，不夾帶中文校系個資。
- 執行 python assets/build.py 重新產生 assets/wiki-data.js


## [2026-11-12] ingest | 莫氏樹蛙資料收錄與特有種知識庫更新 (Froghome、青蛙學堂、臺北水源特定區)
- 新增原始資料: raw/2026-11-12_青蛙學堂-莫氏樹蛙.md、raw/2026-11-12_台北水源特定區-莫氏樹蛙.md、raw/2026-11-12_台灣兩棲類數位典藏-莫氏樹蛙.md
- 新增來源摘要頁: wiki/sources/青蛙學堂-莫氏樹蛙.md、wiki/sources/台北水源特定區-莫氏樹蛙.md、wiki/sources/台灣兩棲類數位典藏-莫氏樹蛙.md
- 新增獨立物種頁: wiki/species/莫氏樹蛙.md (No.07，依據使用者資料順序排列，記錄張氏樹蛙屬新分類、2008年降為一般類非保育野生動物 (IUCN LC) 沿革、橘紅虹彩、大腿內側黑斑與鮮紅底色「紅內褲」嚇敵保護色、體側老人斑、火雞叫聲「呱-阿呱呱呱呱」、一雌多雄交配現象、白色泡沫卵塊與大型黑蝌蚪，以及 1.902 秒鳴叫間隔與 1520 Hz 主頻聲學數據，配備施禮正先生 CC BY 2.0 授權之真實成蛙生態照)
- 更新概念頁:
  - wiki/concepts/台灣36種蛙類名錄.md: 將莫氏樹蛙更新為已收錄 (No.07)，樹蛙科收錄達 4/14 種 (28.6%)，全島蛙類名錄收錄進度推進至 7/36 種 (19.4%)。
  - wiki/concepts/繁殖季節比較.md: 新增莫氏樹蛙依緯度與海拔差異顯著之繁殖期對照（北部春夏、中南部夏秋、東部冬季、溪頭終年），以及一雌多雄（最多 4 雄）抱接與直徑 8 cm 泡沫卵塊特徵。
  - wiki/concepts/蛙類辨識方法.md: 補充莫氏樹蛙橘紅虹彩（結膜炎眼睛）、大腿內側鮮紅帶黑斑（紅內褲保護色）、老人斑特徵，並完善其與台北樹蛙、諸羅樹蛙之鑑別檢索要訣。
- 更新總覽與索引: wiki/overview.md、wiki/index.md (登錄莫氏樹蛙與 3 份新來源，全站累計收錄 7 種蛙類、25 份文獻)。
- 更新網站呈現: assets/app.js:
  - defaultOrder 加入 'species/莫氏樹蛙' (排序 No.07)。
  - 知識庫進度看板更新為 7/36 種 (19.4%)、引用來源 25 份。
  - 新增莫氏樹蛙專屬 SVG 圖徽 (橘紅大眼、墨綠背部、鮮紅黑斑腿部)。
  - 籌備中卡牌推進為「面天樹蛙」與全新科別「黑眶蟾蜍」。
  - 36 種打勾清單更新莫氏樹蛙為已完成打勾標章。
- 執行 python assets/build.py 重新產生 assets/wiki-data.js
