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

function getSignTx(fcn, args, key, address) {
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

function getPermission(fcn, args, key, address) {
    return hashHandler.queryCounter(address).then((result) => {
        let counter = result.data;
        let sigHash = hashHandler.sha256(config.chaincodeId, fcn, args, "", counter, config.feeLimit, address);
        return verifyHandler.signTx(key, sigHash).then((res) => {
            let apdu = res.apdu;
            let code = apdu.slice(apdu.length - 4);
            if (code === '9000') {
                let sig = apdu.slice(0, apdu.length - 4);
                return queryHandler.invoke(address, config.chaincodeId, fcn, args, '',
                    counter, config.feeLimit, sig.toLowerCase()).then((results) => {
                    return Promise.resolve(results);
                }, (err) => {
                    return Promise.reject(err);
                });
            } else {
                return Promise.reject(apdu);
            }
        }, (err) => {
            return Promise.reject(err);
        });
    }).catch(err => {
        return Promise.reject(err);
    });
}

function getDataTag(user) {
    return queryHandler.query(config.chaincodeId, "getDataTag", [user]).then((results) => {
        if (results.success) {
            return {result: true, data: results.data};
        } else {
            return {result: false, error: results.error};
        }
    }, (err) => {
        return {result: false, error: err};
    });
}

function queryUser(user) {
    return queryHandler.query(config.chaincodeId, "queryUser", [user]).then((results) => {
        if (results.success) {
            return {result: true, data: results.data};
        } else {
            return {result: false, error: results.error};
        }
    }, (err) => {
        return {result: false, error: err};
    });
}

module.exports.getSignTx = getSignTx;
module.exports.checkUKey = checkUKey;
module.exports.verifyPIN = verifyPIN;
module.exports.changePIN = changePIN;
module.exports.getPublicKeyAndAddress = getPublicKeyAndAddress;

module.exports.getDataTag = getDataTag;
module.exports.queryUser = queryUser;
module.exports.getUploadPermission = function (args, key, address) {
    args.push('8');
    return getPermission('getDataAccessPermission', args, key, address).then((results) => {
        if (results.success) {
            return {result: true, data: results.data};
        } else {
            return {result: false, error: results.error};
        }
    }, (err) => {
        return {result: false, error: err};
    });
};
module.exports.getDownloadPermission = function (args, key, address) {
    args.push('4');
    return getPermission('getDataAccessPermission', args, key, address).then((results) => {
        if (results.success) {
            return {result: true, data: results.data};
        } else {
            return {result: false, error: results.error};
        }
    }, (err) => {
        return {result: false, error: err};
    });
};
