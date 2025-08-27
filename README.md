# TwitchAuth
TwitchAuth以及關於MCBE TNTCoin Twitch擴展補丁


## 1. 前置條件
- 安裝 [BedrockLive](https://github.com/rqinix/BedrockLive) 服務端
- 配置 `.env`（填寫 Client ID / Secret / API Key 等）
- 安裝依賴 requirements.txt
  ```bash
  npm install -r twitch/requirements.txt
  npm install -r requirements1.txt
  ```
  
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
      - **OAuth Redirect URL**: `https://localhost:5000`
      - **Category**: 依需求選擇（例如 Game Integration）

      建立完成後，記下：
      - `Client ID`
      - `Client Secret`
	 2.	確保 `.env` 已正確填寫 Client ID / Secret。
       - BARK_API 用來通知到設備用 如果不需要直接填none	
	 4.	執行：
      ```js
      node Twauth.js
      ```
     4.	開啟終端顯示的連結完成 OAuth 授權。
	 5.	完成後會生成 tokens.json。

 4. 開始運行

   - 確保你已經安裝完成 BedrockLive 相關依賴以及本項目相關依賴。
   - 運行以下命令啟動服務端，並依指示啟用所有插件：
     ```bash
     npm start
     ```
   - 接著使用 Minecraft Bedrock 客戶端，請使用 [TNTCoinImprove](https://github.com/TwhomeGH/TNTCoinImprove)。  
     該版本已接入 Twitch 小奇點 / 忠誠點數事件支持。

   - 然後連線到你的 BedrockLive 服務器：
     ```bash
     /connect `YOUR_IP`:`YOUR_PORT`
     ```
