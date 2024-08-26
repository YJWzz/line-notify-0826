import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import qs from 'qs';
import {jwtDecode} from 'jwt-decode';
import styles from './ReceivePage.module.css'; // 引入CSS模塊

function Recieve() {
    const [query, setQuery] = useState({});
    const [tokenResult, setTokenResult] = useState({});
    const [idTokenDecode, setIdTokenDecode] = useState({});
    const [data, setData] = useState({
        line_id: "",
    });
    const location = useLocation();

    // 你的 LINE Bot ID
    const lineBotId = '@183gqrmc';

    useEffect(() => {
        // 解析網址參數
        const params = new URLSearchParams(location.search);
        const queryParams = {};
        for (let [key, value] of params.entries()) {
            queryParams[key] = value;
        }
        setQuery(queryParams);

        // 設定POST參數
        const options = qs.stringify({
            grant_type: 'authorization_code',
            code: queryParams.code,
            redirect_uri: process.env.REACT_APP_LINE_CBURL,
            client_id: process.env.REACT_APP_LINE_LOGIN_ID,
            client_secret: process.env.REACT_APP_LINE_LOGIN_SECRET
        });

        // 發送請求並處理回應
        axios.post('https://api.line.me/oauth2/v2.1/token', options, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).then(res => {
            setTokenResult(res.data); // 設定回傳的結果
            const decodedIdToken = jwtDecode(res.data.id_token);
            setIdTokenDecode(decodedIdToken); // 解析 id_token
            // 獲取使用者的 LINE User ID
            const userId = decodedIdToken.sub;
            setData(userId)
            console.log("data:", data)
            const username = decodedIdToken.name;
            const access_token = res.data.access_token;
            setData({ userId, username, access_token });

            // 呼叫 LINE Bot API 發送消息以添加好友
            // const messageData = {
            //     to: userId,
            //     messages: [{
            //         type: 'text',
            //         text: '感謝您添加我為好友！'
            //     }]
            // };
            // axios.post('https://api.line.me/v2/bot/message/push', messageData, {
            //     headers: {
            //         'Authorization': `Bearer ${access_token}`,
            //         'Content-Type': 'application/json'
            //     }
            // }).then(response => {
            //     console.log("成功發送消息", response.data);
            // }).catch(error => {
            //     console.error("發送消息時出錯", error);
            // });
        });
    }, [location.search]);

    //把lineid存入至資料庫裡
    useEffect(() => {
        axios
            .post("http://localhost:8080/signup", data)
            .then((res) => {
                alert(res.data);
            });
    }, [data])//如果無錯誤資訊，資料會存到資料庫裡並且連至sign in

    // Function to handle adding the bot as a friend
    const handleAddFriend = () => {
        const lineAddFriendUrl = `https://line.me/R/ti/p/${lineBotId}`;
        window.open(lineAddFriendUrl, "_blank");
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1>Receive Page</h1>
                <h3>回傳回來的值：{JSON.stringify(query)}</h3>
                <hr />
                <h1>Token API</h1>
                <h3>回傳回來的值: {JSON.stringify(tokenResult)}</h3>
                <hr />
                <h1>IdToken Decode</h1>
                <h3>解析後的值: {JSON.stringify(idTokenDecode)}</h3>
                <hr />
                <h1>需傳入後端的值</h1>
                <h3>解析後的值: {JSON.stringify(data)}</h3>
                <hr />
                <Link to="/Login">回登入頁</Link>
                <hr />
                <button onClick={handleAddFriend}>加入 LINE 好友</button>
            </div>
        </div>
    );
}

export default Recieve;