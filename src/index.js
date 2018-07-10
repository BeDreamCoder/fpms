/*
Copyright Ziggurat Corp. 2018 All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

/**
 * Created by zhangtailin on 2018/6/15.
 */

require('es6-promise').polyfill();
require('isomorphic-fetch');
var config = require('./config.json');
var verifyHandler = require('./impl/verify');
var hashHandler = require('./impl/hash');

var checkUKey = () => {
    return verifyHandler.listKeys().then((res) => {
        return {connected: true, keys: res.names};
    }, (err) => {
        return {connected: false, error: err};
    });
};

var verifyPIN = (key, pin) => {
    return verifyHandler.verifyPIN(key, pin).then((res) => {
        let code = res.apdu;
        if (code === '9000') {
            return {result: true, code: code};
        } else {
            return {result: false, code: code};
        }
    }, (err) => {
        return {result: false, code: '500', error: err};
    });
};

var changePIN = (key, oldpin, newpin) => {
    return verifyHandler.changePIN(key, oldpin, newpin).then((res) => {
        let code = res.apdu;
        if (code === '9000') {
            return {result: true, code: code};
        } else {
            return {result: false, code: code};
        }
    }, (err) => {
        return {result: false, code: '500', error: err};
    });
};

var getPublicKeyAndAddress = (key) => {
    return verifyHandler.getPublicKeyAndAddress(key).then((res) => {
        let apdu = res.apdu;
        let code = apdu.slice(apdu.length - 4);
        if (code === '9000') {
            return {
                result: true,
                publicKey: apdu.slice(0, 128).toLowerCase(),
                address: config.addressPrefix + apdu.slice(128, apdu.length - 4).toLowerCase()
            };
        } else {
            return {result: false, code: apdu};
        }
    }, (err) => {
        return {result: false, code: '500', error: err};
    });
};

function getSignTx(fcn, args, key, address) {
    // 1.query sender counter
    return hashHandler.sha256_data(fcn, args, key, address).then((result) => {
        return verifyHandler.signTx(key, result);
    }, (err) => {
        return {result: false, code: '500', error: err};
    }).then((res) => {
        let apdu = res.apdu;
        let code = apdu.slice(apdu.length - 4);
        if (code === '9000') {
            let sig = apdu.slice(0, apdu.length - 4);
            return {result: true, code: sig.toLowerCase()};
        } else {
            return {result: false, code: apdu};
        }
    }, (err) => {
        return {result: false, code: '500', error: err};
    });
}

module.exports.getSignTx = getSignTx;
module.exports.checkUKey = checkUKey;
module.exports.verifyPIN = verifyPIN;
module.exports.changePIN = changePIN;
module.exports.getPublicKeyAndAddress = getPublicKeyAndAddress;

