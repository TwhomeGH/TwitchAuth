# TwitchAuth
TwitchAuth以及關於MCBE TNTCoin Twitch擴展補丁


## 1. 前置條件
- 安裝 [BedrockLive](https://github.com/rqinix/BedrockLive) 服務端
- 配置 `.env`（填寫 Client ID / Secret / API Key 等）

## 2. 安裝說明
1. 將 `twitch` 資料夾放入 BedrockLive 的插件資料夾：
   ```text
   BedrockLive/dist/plugins/twitch
   ```
   
2.	其餘檔案直接放在 BedrockLive 根目錄：
    ```
    BedrockLive/
     ├── Twauth.js
     ├── tokens.json
     ├── requirements1.txt
     └── ...
    ```
3. 取得 Twitch 授權 Token
   1. **建立 Twitch 開發者應用**  
      前往 [Twitch Developer Console](https://dev.twitch.tv/console/apps) 新增一個應用，並設定：
      - **OAuth Redirect URL**: `http://localhost:5000/auth/twitch/callback`
      - **Category**: 依需求選擇（例如 Game Integration）

      建立完成後，記下：
      - `Client ID`
      - `Client Secret`
	 2.	確保 `.env` 已正確填寫 Client ID / Secret。
	 3.	執行：
      ```js
      node Twauth.js
      ```
   4.	開啟終端顯示的連結完成 OAuth 授權。
	 5.	完成後會生成 tokens.json。
