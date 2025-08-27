import express from 'express';
import https from 'https';
import { exchangeCode, RefreshingAuthProvider } from '@twurple/auth';
import fs from 'fs';  // ✅ 傳統 fs，不用 /promises
import { config } from 'dotenv';
import selfsigned from "selfsigned"
config(); // 讀取 .env


let keyPath='./server.key'
let certPath='./server.crt'

// 檢查檔案是否存在
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {

const attrs = [{ name: 'TwitchAuth', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

fs.writeFileSync(keyPath, pems.private);
fs.writeFileSync(certPath, pems.cert);

console.log('生成完成: server.key & server.crt');

} else {
    console.log('server.key & server.crt 已存在，跳過生成');
}

const options = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
}

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = 'https://localhost:5000';
const scopes = [
    'moderator:read:followers','user:read:chat',
    'chat:read', 'bits:read', 'channel:read:goals',
    'channel:read:subscriptions','clips:edit',
    'channel:read:redemptions'
];

const app = express();

app.get('/', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.send(`請先打開授權 URL取得 code`);

  try {
    // 交換 code 取得 token
    const tokenData = await exchangeCode(clientId, clientSecret, code, redirectUri);
    console.log("to", tokenData);

    // 存下 Access + Refresh Token（callback 版）
    fs.writeFile('./tokens.json', JSON.stringify(tokenData, null, 4), { encoding: 'utf-8' }, (err) => {
      if (err) throw err;
      console.log('Token 已存 tokens.json');
    });

    // 建立 RefreshingAuthProvider
    const authProvider = new RefreshingAuthProvider({ clientId, clientSecret }, tokenData);

    authProvider.onRefresh((userId, newTokenData) => {
      fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), { encoding: 'utf-8' }, (err) => {
        if (err) throw err;
        console.log('Token 已自動更新');
      });
    });

    res.send('成功取得 token！關閉此頁面即可。');
    // 延遲一秒再關閉 server，確保瀏覽器收到回應
    setTimeout(() => {
        app.close(() => {
        console.log('HTTPS 服務器已關閉');
        process.exit(0); // 可選，完全退出程式
        });
    }, 1000);

  } catch (err) {
    res.status(500).send(err.message);
  }
});

https.createServer(options, app).listen(5000, () => {
  console.log('HTTPS 伺服器運行在 https://localhost:5000');
  console.log('請在瀏覽器打開以下 URL取得授權 code:');
  console.log(`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes.join('+')}`);
});