# RI Prompt Builder｜WoS Research Intelligence 指令產生器

依據三份使用者提供的原始模板，讓非程式使用者以網頁表單產生完整 WoS Research Intelligence Prompt。

## 支援的模板

- **College Research Intelligence v1.3**：學院研究績效、領域特色、比較分析。
- **Department Research Intelligence v1.2.2**：系所研究、研究能力與自主品保研究佐證。
- **Researcher Research Intelligence v1.0**：現職教師研究自評或應聘者學術研究證據與系所研究主題對照。

本工具**不呼叫 WoS API，不執行 AI 分析，也不對應聘者進行聘任決策**。它只是以原始 Prompt 模板為基礎，替換變數設定和對應的 `{{KEY}}` 參照，輸出完整文字。

## 直接試用

直接在電腦上開啟 `index.html` 即可使用，因為完整模板已包入 `assets/templates.js`；不需安裝 npm 或執行編譯。

也可以用：

```bash
python -m http.server 8000
```

再開啟 `http://localhost:8000/`。

## 部署 GitHub Pages

1. 新增 GitHub repository，例如 `ri-prompt-builder`。
2. 將本資料夾內容全部上傳到 repository 根目錄（包含 `index.html`、`assets/`、`templates/` 和 `.nojekyll`）。
3. 前往 repository **Settings → Pages → Build and deployment**。
4. 選擇 **Deploy from a branch**，選擇 **main / (root)**，再 **Save**。
5. 發布成功後，使用 `https://<github-username>.github.io/ri-prompt-builder/` 開啟網站。

站點不需要 server、資料庫或 API key。請注意 GitHub Pages 上發布的模板文字及網頁原始碼會對訪客公開；使用者在表單輸入的內容不會透過此工具傳送到後端，預設也不會儲存在瀏覽器持久化空間。

## 更新模板

將新的完整 Prompt 原始文字替換 `templates/` 中對應的 `.txt`，再執行：

```bash
python scripts/build_templates.py
```

這會重新產生 `assets/templates.js`。當新增或改名全域變數時，也要同步更新 `assets/app.js` 中的表單配置／欄位名稱及顯示條件。

## 技術與資料處理

- HTML5 + CSS + JavaScript，無前端框架、外部字型或第三方 CDN。
- 輸入資料僅在使用者瀏覽器記憶體中處理；重新整理後即消失。
- ORCID 支援 `https://orcid.org/...` 貼上與 ISO 7064 11,2 校驗碼檢查。
- 研究者英文姓名、ORCID、Web of Science ResearcherID 至少填一項。
- WoS/RI 的識別與研究文獻集合仍需在 RI 查詢後確認；本工具不驗證學術成果身分。
- 完整 TXT / Markdown 複製與下載，不會截斷模板正文。
- 原始三份模板置於 `templates/`，方便版本比較與維護。

## 原始碼授權與內容

本專案由內部提供的三份 Prompt 文字組成。正式公開部署前請確認原始 Prompt 的發布權限與校內上線規範。WoS、Research Intelligence、ORCID 等名稱及識別碼歸各自所有者。
