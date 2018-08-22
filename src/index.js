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
var ethUtils = require('ethereumjs-util');
var hashHandler = require('./impl/hash');
var queryHandler = require('./impl/query');
var verifyHandler = require('./impl/verify');

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

function getHashSign(key, rawData) {
    var signHash = ethUtils.sha256(Buffer.from(rawData));
    return verifyHandler.signTx(key, signHash.toString('hex')).then((res) => {
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

function permissionVerify(sign, content) {
    return queryHandler.query(config.chaincodeId, "permissionVerify", [sign, content]).then((results) => {
        if (results.success) {
            return {result: true, data: results.data};
        } else {
            return {result: false, error: results.error};
        }
    }, (err) => {
        return {result: false, error: err};
    });
}

function monitoringRecord(args, key, address) {
    return hashHandler.queryCounter(address).then((result) => {
        if (!result.success) {
            return {result: false, error: result.error};
        }
        let fcn = "monitoringRecord";
        let counter = result.data;
        let sigHash = hashHandler.sha256(config.chaincodeId, fcn, args, "", counter, config.feeLimit, address);
        return verifyHandler.signTx(key, sigHash).then((res) => {
            let apdu = res.apdu;
            let code = apdu.slice(apdu.length - 4);
            if (code === '9000') {
                let sig = apdu.slice(0, apdu.length - 4);
                return queryHandler.invoke(address, config.chaincodeId, fcn, args, '',
                    counter, config.feeLimit, sig.toLowerCase()).then((results) => {
                    return {result: true, data: results};
                }, (err) => {
                    return {result: false, error: err};
                });
            } else {
                return {result: false, code: apdu};
            }
        }, (err) => {
            return {result: false, error: err};
        });
    }).catch(err => {
        return {result: false, error: err};
    });
}

module.exports.checkUKey = checkUKey;
module.exports.verifyPIN = verifyPIN;
module.exports.changePIN = changePIN;
module.exports.getPublicKeyAndAddress = getPublicKeyAndAddress;
module.exports.getHashSign = getHashSign;
module.exports.permissionVerify = permissionVerify;
module.exports.monitoringRecord = monitoringRecord;
