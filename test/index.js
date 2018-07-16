/*
Copyright Ziggurat Corp. 2018 All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

var impl = require('../src/index');

var uAddress = 'ib4867fc39737051fa280708a966f2ce36148691d';
impl.checkUKey().then((res) => {
    console.log(res);
    if (!res.connected) return;

    let key = res.keys[0];
    impl.verifyPIN(key, '123456').then((res) => {
        console.log(JSON.stringify(res));
    });
    // impl.getSignTx('transfer', ['i4230a12f5b0693dd88bb35c79d7e56a68614b199', '1000'], key, uAddress).then((res) => {
    //     console.log(JSON.stringify(res));
    // });
    
    // impl.changePIN(key, '1234567', '12345678').then((res) => {
    //     console.log(JSON.stringify(res));
    // });
    // impl.getPublicKeyAndAddress(key).then((res) => {
    //     console.log(res);
    // });

    // impl.getDataTag("ie43e15257182377bc957a99ce0ff65ff1c876a1b").then((res) => {
    //     console.log(JSON.stringify(res));
    // });

    // impl.queryUser(uAddress).then((res) => {
    //     console.log(JSON.stringify(res));
    // });

    // impl.getUploadPermission([uAddress, "208a5a42d4843158fd289d233ff4dac3ea7f1149f68d282844a6e929cd3271c42e3dda298895b640b25dda93486e61ebe351ea1895047b5e139bdb7ffcd4890500",
    //     "testHash", "testTag", "30", "i3caf082aa98a78f4aafe1268cea4a4154a9b84f4"], key, "ib4867fc39737051fa280708a966f2ce36148691d").then((res) => {
    //     console.log(JSON.stringify(res));
    // });

    // impl.getDownloadPermission([uAddress, "208a5a42d4843158fd289d233ff4dac3ea7f1149f68d282844a6e929cd3271c42e3dda298895b640b25dda93486e61ebe351ea1895047b5e139bdb7ffcd4890500",
    //     "testHash", "testTag", "30", "i3caf082aa98a78f4aafe1268cea4a4154a9b84f4"], key, uAddress).then((res) => {
    //     console.log(JSON.stringify(res));
    // });
});
