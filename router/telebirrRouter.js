const express = require('express');
const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const axios = require('axios');

const router = express.Router();
const api = 'http://ip:port/service-openup/toTradeWebPay';
const appkey = 'a8955b02b5df475882038616d5448d43';
const publicKey = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgIwN9mVEWG9kagbxt2ippr8RNzK/fhBXcZa1ViQRnClz3VTjk9cnomIds3AFhsiNihNTPVSirbeCOKxr99mvJuuGdarzfkNEIbOkSLFfO7P6HdQHQjaTg9LueWUy1tz1gh0dsNpg4zPVr+T9lTCTWOnDgU2hNixo0r9wo72dxwXTc55vX4X7sWSz29WzrlKyyBQ2+CcA55EYp6cWwpkaTSfV+Boymr/ZnLI7qlp/7FGZk2574fvE/9uCZdnAHYCTzKOFUjEwZ9o8sw/f+TVglbKvRDSMpqsZXN6DY7FvXMp52ACM7OAp63y8Hir2YKAWj6OJ8KVoS8TAUeDmHyaWwwIDAQAB';

router.post('/submit', (req, rsp) => {
    let signObj = req.body;
    signObj.appId = req.body.appid;
    signObj.appKey = appkey;
    delete signObj.appid;
    let signStr = jsonSort(signObj);
    let sign = sha256(signStr);
    delete signObj.appKey;
    let ussdStr = JSON.stringify(signObj);
    let ussd = rsa_encrypt(ussdStr);
    axios
        .post(api, {appid: signObj.appId, sign: sign, ussd: ussd})
        .then(res => {
            console.log(res);
            if (res.status == 200 && res.data.code == 200) {
                rsp.redirect(res.data.data.toPayUrl);
            } else {
                rsp.redirect("/demo.html?errmsg=" + res.data.message);
            }
        })
        .catch(error => {
            console.error(error);
            rsp.redirect("/demo.html?errmsg=" + error.message);
        });
});

router.post('/getData', (req, rsp) => {
    let signObj = req.body;
    signObj.appId = req.body.appid;
    signObj.appKey = appkey;
    delete signObj.appid;
    let signStr = jsonSort(signObj);
    let sign = sha256(signStr);
    delete signObj.appKey;
    let ussdStr = JSON.stringify(signObj);
    let ussd = rsa_encrypt(ussdStr);
    rsp.send({
        appid: signObj.appId,
        sign: signStr,
        ussd: ussdStr,
        encode: JSON.stringify({appid: signObj.appId, sign: sign, ussd: ussd})
    });
});

router.post('/notify', (req, rsp, next) => {
    let postData = "";
    req.addListener("data", function (data) {
        postData += data;
    });
    req.addListener("end", function () {
        let query = postData;
        console.log('======================== GET RESULT DATA ========================');
        console.log(query);
        console.log('======================= GET DECRYPTED DATA ======================');
        let data = decrypt(query);
        console.log(data);
        //BUSINESS PROCESSING
    });
    let response = {"code": 0, "msg": "success"};
    console.log('======================== RESPONSE ========================');
    console.log(response);
    rsp.send(response);
});

function jsonSort(jsonObj) {
    let arr = [];
    for (var key in jsonObj) {
        arr.push(key);
    }
    arr.sort();
    let str = '';
    for (var i in arr) {
        str += arr[i] + "=" + jsonObj[arr[i]] + "&";
    }
    return str.substr(0, str.length - 1);
}

function sha256(data) {
    var hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

// publicKey encrypt
const rsa_encrypt = (data) => {
    let key = new NodeRSA(getPublicKey(publicKey));
    key.setOptions({encryptionScheme: 'pkcs1'});
    let encryptKey = key.encrypt(data, 'base64');
    return encryptKey;
}

function insertStr(str, insertStr, sn) {
    var newstr = '';
    for (var i = 0; i < str.length; i += sn) {
        var tmp = str.substring(i, i + sn);
        newstr += tmp + insertStr;
    }
    return newstr;
}

const getPublicKey = function (key) {
    const result = insertStr(key, '\n', 64);
    return '-----BEGIN PUBLIC KEY-----\n' + result + '-----END PUBLIC KEY-----';
};

// publicKey decrypt
function decrypt(data) {
    const key = new NodeRSA(getPublicKey(publicKey));
    key.setOptions({encryptionScheme: 'pkcs1'});
    const decrypted = key.decryptPublic(data, 'utf8');
    return decrypted;
}

module.exports = router;
