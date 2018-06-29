var impl = require('../src/index');

impl.checkUKey().then((res) => {
    console.log(res);
    if (!res.connected) return;

    let key = res.keys[0];
    impl.verifyPIN(key, '1234567').then((res) => {
        console.log(JSON.stringify(res));
    });

    impl.getSignTx('transfer',['i4230a12f5b0693dd88bb35c79d7e56a68614b199', 'INK', '100000000000'], key, 'ie1e0d94665312767a223b3be5c4541ca3b56de0d').then((res) => {
        console.log(JSON.stringify(res));
    });
    // impl.changePIN(key, '1234567', '12345678').then((res) => {
    //     console.log(JSON.stringify(res));
    // });
    impl.getPublicKeyAndAddress(key).then((res) => {
        console.log(res);
    });
});
