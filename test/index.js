/*
Copyright Ziggurat Corp. 2018 All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

var impl = require('../src/index');

(async () => {
    try {
        console.log("check Ukey is connected");
        let res = await impl.checkUKey();
        console.log(JSON.stringify(res, null, 4));
        if (!res.connected) return;

        console.log("\nverify Ukey PIN");
        let key = res.keys[0];
        let pin = await impl.verifyPIN(key, '123456');
        console.log(JSON.stringify(pin, null, 4));

        // impl.changePIN(key, '1234567', '12345678').then((res) => {
        //     console.log(JSON.stringify(res));
        // });

        console.log("\nget Ukey publicKey and address");
        let data = await impl.getPublicKeyAndAddress(key);
        console.log(JSON.stringify(data, null, 4));

        let uAddress = data.address;

        console.log("\ndata sign");
        let sig = await impl.getHashSign(key, "hello world");
        console.log(JSON.stringify(sig, null, 4));

        let verify = await impl.permissionVerify("2b71b953d38a69537d5fa7e8fd71d860d66655b17980d64a22c1b1da517592d9534a69545a0f71caa8ce58e03cae6c8e0800a76a139448c32c11b8f299345e1700",
            '{"permission":true,"operation tag":4,"user address":"ie43e15257182377bc957a99ce0ff65ff1c876a1b","data hash":"JunJiB","data tag":"131074","timestamp":"2018-07-27T12:36:04.1680779Z","validity period":20}');
        console.log(JSON.stringify(verify, null, 4));

        let record = await impl.monitoringRecord(["testIDD", "testTime", "2", "testNum", "testHash"], key, uAddress);
        console.log(JSON.stringify(record, null, 4));

    } catch (e) {
        console.log("catch err:", e)
    }
})();