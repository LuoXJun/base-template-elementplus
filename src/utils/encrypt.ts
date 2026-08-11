// @ts-ignore
import CryptoJS from 'crypto-js';

export const handleEncrypt = (ciphertextStr: string) => {
    // 将 Base64 字符串解析为 WordArray 作为 AES 密钥
    const key = CryptoJS.enc.Base64.parse('u5keBKobM08TGd+RUNvjJw==');

    // 明文数据
    const plaintext = ciphertextStr;

    // 执行 AES/ECB 加密，使用 PKCS7 填充（等价于 PKCS5）
    const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        mode: CryptoJS.mode.ECB,
        // 使用 PKCS7 代替 AnsiX923
        padding: CryptoJS.pad.Pkcs7
    });

    console.log(encrypted.toString(), '加密后的数据');
    return encrypted.toString();
};
