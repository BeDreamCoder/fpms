/**
 * Created by zhangtailin on 2018/6/15.
 */

var ethUtils = require('ethereumjs-util');
var ProtoBuf = require('protobufjs');
var config = require('../config.json');
var Long = require('long');
var path = require('path');
var verifyHandler = require('./verify');
var builder = ProtoBuf.loadProtoFile(path.join(__dirname + "/../../protos/chaincode.proto"));
var protos = builder.build("protos");
var SignContent = protos.SignContent;

var server_address = 'http://' + config.host + ':' + config.port;

function _sha256(ccId, fcn, arg, msg, counter, inkLimit, senderAddress) {
    var signContent = new SignContent();

    var args = [];
    args.push(Buffer.from(fcn ? fcn : 'invoke', 'utf8'));
    for (var i = 0; i < arg.length; i++) {
        args.push(Buffer.from(arg[i], 'utf8'));
    }
    var invokeSpec = {
        type: protos.ChaincodeSpec.Type.GOLANG,
        chaincode_id: {
            name: ccId
        },
        input: {
            args: args
        }
    };
    var senderSpec = {
        sender: Buffer.from(senderAddress),
        counter: Long.fromString(counter.toString()),
        ink_limit: Buffer.from(inkLimit),
        msg: Buffer.from(msg)
    };

    signContent.setChaincodeSpec(invokeSpec);
    signContent.setSenderSpec(senderSpec);
    let dataHash = ethUtils.sha256(signContent.toBuffer());
    return dataHash.toString('hex');
}

function _invoke(sender, ccId, fcn, args, msg, counter, inkLimit, sig) {
    let data = {
        cc_id: ccId,
        fcn: fcn,
        sender: sender,
        args: args,
        message: msg,
        counter: counter,
        ink_limit: inkLimit,
        sig: sig
    };
    return fetch("http://" + server_address + "/invoke", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    });
}

function query(ccId, fcn, args) {
    let data = {
        cc_id: ccId,
        fcn: fcn,
        args: args
    };
    return fetch("http://" + server_address + "/query", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    }).then((result) => {
        return result.json();
    });
}

function getPermission(fcn, args, key, address) {
    // 1.query sender counter
    return queryCounter(address).then((results) => {
        let ccId = 'token';
        let inkLimit = '100000000000';
        let counter = results.json().data;
        let dataHash = _sha256(ccId, fcn, args, '', counter, inkLimit, address);
        // 2. get tx sign
        return verifyHandler.signTx(key, dataHash).then((signResp) => {
            let ret;
            if (signResp.length > 4) {
                ret = signResp.slice(signResp.length - 4, signResp.length);
            }
            if (!ret || ret !== "9000") {
                return Promise.reject(signResp);
            }
            // 5. invoke chaincode
            // TODO
            let sig = '';
            return _invoke(address, ccId, fcn, args, '', counter, inkLimit, sig);
        }, (err) => {
            return Promise.reject(err);
        }).then((result) => {
            return Promise.resolve(result.json());
        }, (err) => {
            return Promise.reject(err);
        });
    }, (err) => {
        return Promise.reject(err);
    });
}

function _query(ccId, fcn, args) {
    let data = {
        cc_id: ccId,
        fcn: fcn,
        args: args
    };
    return fetch("http://" + server_address + "/query", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    }).then((result) => {
        return result.json();
    });
}

function queryInfo(fcn, key, pin) {
    // 1.verifyPIN
    verifyHandler.verifyPIN(key, pin).then((code) => {
        if (!code.hasOwnProperty("apdu") || code.apdu !== "9000") {
            return Promise.reject(code);
        }
        // 2. get sender address
        return verifyHandler.module.exports.getPublicKeyAndAddress = getPublicKeyAndAddress;
        (key);
    }, (err) => {
        return Promise.reject(err);
    }).then((msg) => {
        let ret;
        if (msg.length > 4) {
            ret = msg.slice(msg.length - 4, msg.length);
        }
        if (!ret || ret !== "9000") {
            return Promise.reject(msg);
        }
        // TODO
        let address = '';
        let ccId = 'token';
        // 3.query chaincode getDataTag
        return _query(ccId, fcn, address);
    }, (err) => {
        return Promise.reject(err);
    }).then((result) => {
        return Promise.resolve(result.json());
    }, (err) => {
        return Promise.reject(err);
    }).catch((err) => {
        return Promise.reject(err);
    });
}

function queryCounter(address) {
    let data = {
        from_address: address,
    };
    return fetch(server_address + "/query-counter", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify(data)
    });
}

function sha256_data(fcn, args, key, address) {
    // return queryCounter(address).then((results) => {
    //     let ccId = 'token';
    //     let inkLimit = '100000000000';
    //     let counter = results.json().data;
    //     return Promise.resolve(_sha256(ccId, fcn, args, '', counter, inkLimit, address));
    // }).catch(err => {
    //     return Promise.reject(err);
    // });

    let ccId = 'token';
    let inkLimit = '100000000000';
    let counter = 0;
    return Promise.resolve(_sha256(ccId, fcn, args, '', counter, inkLimit, address));

}

module.exports.sha256_data = sha256_data;

module.exports.getDataTag = function (key, pin) {
    queryInfo('getDataTag', key, pin);
};

module.exports.queryUser = function (key, pin) {
    queryInfo('queryUser', key, pin);
};

module.exports.getUploadPermission = function (args, key, pin) {
    return getPermission('getUploadPermission', args, key, pin);
};

module.exports.getDownloadPermission = function (args, key, pin) {
    return getPermission('getDownloadPermission', args, key, pin);
};

module.exports.uploadConfirm = function (args, key, pin) {
    return getPermission('uploadConfirm', args, key, pin);
};

module.exports.downloadConfirm = function (args, key, pin) {
    return getPermission('downloadConfirm', args, key, pin);
};
