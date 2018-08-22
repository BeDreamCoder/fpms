/*
Copyright Ziggurat Corp. 2018 All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

var impl = require('../src/index');

(async () => {
    try {
        console.log("1.check Ukey is connected");
        let res = await impl.checkUKey();
        console.log(JSON.stringify(res, null, 4));
        if (!res.connected) return;

        console.log("\n2.verify Ukey PIN");
        let key = res.keys[0];
        let pin = await impl.verifyPIN(key, '123456');
        console.log(JSON.stringify(pin, null, 4));

        console.log("\n3.get Ukey publicKey and address");
        let data = await impl.getPublicKeyAndAddress(key);
        console.log(JSON.stringify(data, null, 4));

        console.log("\n4.get Ukey mnemonic");
        let words = await impl.getMnemonic(key);
        console.log(JSON.stringify(words, null, 4));

        let mnemonic = words.code;

        console.log("\n5.reset Ukey that mean create new private key");
        let verify = await impl.externalValidation(key);
        console.log("external validation:", JSON.stringify(verify, null, 4));
        let reset = await impl.resetUkey(key);
        console.log("reset Ukey:", JSON.stringify(reset, null, 4));

        console.log("\n6.get Ukey new publicKey and address");
        let newdata = await impl.getPublicKeyAndAddress(key);
        console.log(JSON.stringify(newdata, null, 4));

        console.log("\n7.recover Ukey old private key");
        let recover = await impl.recoverPrikey(key, mnemonic);
        console.log(JSON.stringify(recover, null, 4));

        console.log("\n8.get latest Ukey publicKey and address");
        let latestdata = await impl.getPublicKeyAndAddress(key);
        console.log(JSON.stringify(latestdata, null, 4));

    } catch (e) {
        console.log("catch err:", e)
    }
})();


