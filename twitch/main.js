import { ApiClient } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';
import { EventSubWsListener } from '@twurple/eventsub-ws';
import { promises as fs } from 'fs';


import axios from 'axios';

import { config } from 'dotenv';
config(); // 讀取 .env

//console.log(config().parsed)
const Bark=process.env.BARK_API

// --- 封裝通知 function ---














async function sendBarkNotification(title="Twitch",comment, icon) {
    // 判斷 Bark 是否可用
    if (!Bark || Bark.toLowerCase() === "none") {
        console.log("Bark 未設定，略過推送");
        return;
    }

    try {
        // 組成要送出的 JSON 內容
        const payload = {
            title: title,
            body: comment,
            icon: icon || undefined, // 沒傳就不放
        };

        // 傳送 POST 請求到 Bark
        const res = await axios.post(Bark, payload, {
            headers: { "Content-Type": "application/json" },
        });

        console.log("✅ Bark 推送成功", res.status);
    } catch (err) {
        console.error("❌ Bark 推送錯誤:", err.message);
    }
}

export async function plugin(twitchLiveMcbe) {
    const { minecraft } = twitchLiveMcbe;
    
    
    //
    // --- 1. Auth 設定 ---
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    
    const tokenData = JSON.parse(await fs.readFile('./tokens.json', 'utf-8'));
    const authProvider = new RefreshingAuthProvider({ clientId,clientSecret });
    
   authProvider.onRefresh(async (userId,newTokenData) => {
        await fs.writeFile(`./tokens.json`,JSON.stringify(newTokenData,null,4),"utf-8")
});

    await authProvider.addUserForToken(tokenData);
    const apiClient = new ApiClient({ authProvider });
    
    const user = await apiClient.users.getUserByName("coffeelatte0709");
    const tuser=user.id
    
    console.log("user",tuser)
    // --- 2. EventSub WebSocket 監聽器 ---
    const listener = new EventSubWsListener({ apiClient, port: 0 }); // port 0 自動選取
    await listener.start();

    // --- 3. 連線通知給 Minecraft ---
    const data = { twitchUserName: 'coffeelatte0709' };
    minecraft.sendCommand(
        `tellraw @a {"rawtext":[{"text":"§5§l§dTwitch§f §eCoin§f §aplugin loaded§f!"}]}`
    );
    minecraft.sendCommand(
        `scriptevent tntcoin:connected ${JSON.stringify(data)}`
    );

    async function getUserIcon(id) {
         const uss=await apiClient.users.getUserById(id)
         console.log("icon",uss.profilePictureUrl)
         return uss.profilePictureUrl
    }
    
    

    // --- 4. 訂閱事件 ---
    // Cheer (Bits 打賞)
    listener.onChannelCheer(tuser,tuser, (event) => {
        
        console.log("Cheer",event)
        const message = JSON.stringify({
            uniqueId: event.userId,
            nickname: event.userDisplayName,
            rewardCost: event.bits,
            type:"Bits",
            comment: `送出 ${event.bits} 小奇點`
        });
        const JMes=JSON.parse(message)
        console.log("Cheer",JMes)
        //const GURL=`${Bark}/${encodeURIComponent(JMes.nickname)}/${encodeURIComponent(JMes.comment)}`
        //console.log(encodeURI(GURL))
        sendBarkNotification(JMes.nickname,JMes.comment)
        minecraft.sendScriptEvent('tntcoin:reward', message);
    });


    listener.onChannelFollow(tuser,tuser, async (event) => {
        
        const message = JSON.stringify({
            uniqueId: event.userId,
            nickname: event.userDisplayName,
            comment:`${JMes.nickname} 關注了主播`
        });
        const JMes=JSON.parse(message)
        console.log("Follow",JMes)
        //const GURL=`${Bark}/${encodeURIComponent(JMes.comment)}`
        //console.log(encodeURI(GURL))
        
        
        sendBarkNotification(JMes.nickname,"關注了主播",getUserIcon(event.userId))

        minecraft.sendScriptEvent('tntcoin:follow', message);
    });
    
    
    listener.onChannelChatMessage(tuser,tuser, async (event) => {

        const message = JSON.stringify({
            uniqueId: event.chatterId,
            nickname: event.chatterDisplayName,
            comment: event.messageText
        });


        const JMes=JSON.parse(message)
        const icon=await getUserIcon(event.chatterId)
        //const GURL=`${Bark}/${encodeURIComponent(JMes.nickname)}/${encodeURIComponent(JMes.comment)}`
        sendBarkNotification(JMes.nickname,JMes.comment,icon)
        console.log("Message",JMes)
        minecraft.sendScriptEvent('tntcoin:chat', message);
    });
    
    listener.onChannelGoalProgress(tuser, async (event)=>{
        
        let Goal= {
            currentAmount:event.currentAmount,
            target:event.targetAmount,
            content:event.description

        }

        const message = JSON.stringify({
            uniqueId: event.id,
            nickname: event.type,
            comment: `目標：${Goal.currentAmount}/${Goal.target}`
        });
        
        const JMes=JSON.parse(message)
        //const GURL=`${Bark}/${encodeURIComponent(JMes.nickname)}/${encodeURIComponent(JMes.comment)}`
        //console.log(encodeURI(GURL))

        sendBarkNotification(JMes.nickname,JMes.comment)
        console.log("Message",JMes)
        minecraft.sendScriptEvent('tntcoin:chat', message);
        
    })

    listener.onChannelRaidFrom(tuser, async(event)=>{
        
        let Raid= {
            name:event.raidedBroadcasterDisplayName,
            id:event.raidedBroadcasterName,
            view:event.viewers

        }

        const message = JSON.stringify({
            uniqueId: event.raidedBroadcasterId,
            nickname: Raid.name,
            comment: `${Raid.name} ${Raid.id} 帶來了 ${Raid.view} 個觀眾`
        });
        
        const JMes=JSON.parse(message)
        //const GURL=`${Bark}/${encodeURIComponent(JMes.nickname)}/${encodeURIComponent(JMes.comment)}`
        //console.log(encodeURI(GURL))
         const icon=await getUserIcon(Raid.id)
        sendBarkNotification(JMes.nickname,JMes.comment,icon)
        console.log("Message",JMes)
        minecraft.sendScriptEvent('tntcoin:chat', message);
        
    })

    listener.onChannelSubscription(tuser,async (event)=>{

        const message = JSON.stringify({
            uniqueId: event.userId,
            nickname: event.userDisplayName,
            comment: `${event.userDisplayName} 訂閱：${event.tier}`
        });
        
        const JMes=JSON.parse(message)
        //const GURL=`${Bark}/${encodeURIComponent(JMes.nickname)}/${encodeURIComponent(JMes.comment)}`
        //console.log(encodeURI(GURL))
         const icon=await getUserIcon(event.userId)
        sendBarkNotification(JMes.nickname,JMes.comment,icon)
        console.log("Message",JMes)
        minecraft.sendScriptEvent('tntcoin:chat', message);
        
    

    })


    listener.onChannelRedemptionAddForReward(tuser,async (event)=>{

        const message = JSON.stringify({
            uniqueId: event.userId,
            nickname: event.userDisplayName,
            rewardCost:event.rewardCost,
            type:"Reward",
            comment: `兌換：${event.rewardTitle} ${event.rewardCost} 點\n${event.rewardPrompt}`
        });
        
        const JMes=JSON.parse(message)
        //const GURL=`${Bark}/${encodeURIComponent(JMes.nickname)}/${encodeURIComponent(JMes.comment)}`
        //console.log(encodeURI(GURL))
         const icon=await getUserIcon(event.userId)
        sendBarkNotification(JMes.nickname,JMes.comment,icon)
        console.log("Message",JMes)
        minecraft.sendScriptEvent('tntcoin:reward', message);
        
    

    })

    
    // 其他事件處理...



}
