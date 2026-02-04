import express from 'express';
import cors from 'cors';
import axios from 'axios';
import https from 'https';

const app = express();

app.use(cors());

// 解析 JSON 请求体
app.use(express.json());

// 代理路由
app.post('/api', async (req, res) => {
    try {
        const response = await axios.post(
            'https://222.85.202.83:29801/evo-apigw/evo-brm/1.0.0/device/channel/subsystem/page',
            {
                pageNum: 1,
                pageSize: 1000,
                username: 'OpenAPI',
                password: 123456,
                clientId: 'OpenAPI',
                clientSecret: '8304956f-fb19-4e70-a8e7-fb0ac7455789',
                service: 'ThirdParty',
                grantType: 'password',
                encryptedText:
                    'EKTkX5B8RxJ3jnNUkiO1w9jJdyWNdx6fS20fj1ks9/QJEmJ6fh5Qf25x1MbnbGwBo0WmV0nmt3cLqGOBAbVuyl2xXvoRpCYNJWs4/ulERbObMqsgR15Tn0hAfVcs7itfF7ewqB3crKmLiAfY22KunbWNXS9Ddv+pUKDLhd0k+5s=',
                public_key:
                    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDHzQ13WGXZE0CeG82faVAs/170753Z+MMLeOBZzIgM/xwvrPRO1d/0wGc+SBOoOTVv2GXs1lI2ijtgYpTiywHFkkT3Ip+MBL7xRIk7QxtaAhBoeI01sCHXOthBOnkXO487ZbgMDxRxQ1860SFsKDHprbd1lOE6S7S3INhRsvBqcwIDAQAB'
            },
            {
                headers: {
                    Authorization: 'bearer 5:P9y71ciMtO5O4hyKG6Pmo5KklspsazhY',
                    'Content-Type': 'application/json'
                },
                httpsAgent: new https.Agent({ rejectUnauthorized: false })
            }
        );
        res.status(response.status).set(response.headers).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({
            error: error.message,
            details: error.response?.data
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`代理服务器运行在 http://localhost:${PORT}`);
});
