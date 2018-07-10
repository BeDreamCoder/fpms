/*
Copyright Ziggurat Corp. 2018 All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

var impl = require('../src/index');

impl.checkUKey().then((res) => {
    console.log(res);
    if (!res.connected) return;

    let key = res.keys[0];
    impl.verifyPIN(key, '123456').then((res) => {
        console.log(JSON.stringify(res));
    });

    impl.getSignTx('transfer', ['i4230a12f5b0693dd88bb35c79d7e56a68614b199', 'INK', '1000'], key, 'i50601cac9fd70ee1b129c36de687c1f53e8035a9').then((res) => {
        console.log(JSON.stringify(res));
    });
    // impl.changePIN(key, '1234567', '12345678').then((res) => {
    //     console.log(JSON.stringify(res));
    // });
    impl.getPublicKeyAndAddress(key).then((res) => {
        console.log(res);
    });
});
