## 🔐 API 安全規範 (MD5_AUTH)

### 🎯 目的
為了確保所有 API 請求的真實性與完整性，  
前端（React/Next.js）與後端（Django / FastAPI）之間的每一次 API 呼叫  
都需經過 **MD5 簽章驗證**。

---

### ⚙️ MD5 驗證機制設計

| 項目 | 說明 |
|------|------|
| **演算法** | MD5（Message-Digest Algorithm 5） |
| **簽章欄位** | `sign` |
| **簽章組成** | 以請求參數 + 金鑰 `SECRET_KEY` 組合後產生 MD5 雜湊值 |
| **金鑰來源** | 伺服器端 `.env` 變數：`API_SECRET_KEY` |
| **驗證位置** | 所有 `/api/` 前綴的保護端點（不含登入/註冊） |
| **時效性** | 每次請求必須包含時間戳記 `timestamp`（例如 UNIX time, 毫秒） |
| **防重送** | 伺服器檢查 timestamp 是否在允許時間範圍（例如 ±5 分鐘） |

---

### 🧮 簽章生成邏輯

1️⃣ 前端將所有參數按 key 排序（ASCII順序）  
2️⃣ 將所有 key=value 用 `&` 連接成字串  
3️⃣ 在最後加上 `&key=API_SECRET_KEY`  
4️⃣ 將整段字串做 MD5 並轉為小寫十六進位字串  
