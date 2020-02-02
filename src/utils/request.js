import Taro from '@tarojs/taro'
import qs from 'qs'
import {
    server,
    privateKey,
    bindApi
} from '../config';
import {
    hex_sha1
} from './security/sha1'
import {forge} from './security/forge'

function get_params(api, params, serverType,signType) {
    let data = {
        api,
        signType,
        ...params
    }
    const auth = Taro.getStorageSync('auth_token')
    if (auth) {
        data.auth = auth
    }

    if (serverType == 'sso') {
        data = {
            ...data,
            version: '1',
            proType: 'cs',
            clientType: Taro.getStorageSync('clientType'),
            deviceId: '12345',
            platform: Taro.getStorageSync('platform'),
        }
    }
    if (serverType == 'integral') {
        data = {
            ...data,
            version: '1',
            proType: 'cs',
        }
    }

    data = get_signature(data, serverType)

    return data
}

function get_signature(params, serverType) {
    let request = {
        'flag': server[serverType].flag,
        'timestamp': new Date().getTime(),
        ...params
    }
    request['sign'] = calc_signature(request)
    return request
}

function calc_signature(parms) {

    let sign = ''
    let tmpArr = []
    let tmpStr = ''
    let result = ''
    for (let key in parms) {
        if (parms[key]) {
            tmpArr.push(key)
        }
    }
    tmpArr = tmpArr.sort().reverse()

    for (let i = 0; i < tmpArr.length; i++) {
        if (typeof (parms[tmpArr[i]]) === 'object') {
            tmpStr = tmpStr + tmpArr[i].toLowerCase() + JSON.stringify(parms[tmpArr[i]])
        } else {
            tmpStr = tmpStr + tmpArr[i].toLowerCase() + parms[tmpArr[i]]
        }

    }

    // console.log(tmpArr,tmpStr)

    if (parms.signType == 'sha') {
        let sha = hex_sha1(utf16to8(tmpStr))
        let shaLength = sha.length
        let count = parseInt(tmpArr.length * 1.4)

        if (count >= shaLength) {
            count = shaLength
        }

        let step = parseInt(shaLength / count)

        for (let i = 0; i < count; i++) {
            let num = Math.floor(i * step)
            sign = sign + sha.charAt(num)
        }
        result = sign
    } else {
        var privKey = forge.pki.privateKeyFromPem(privateKey);
        const md = forge.md.sha1.create()
        md.update(tmpStr, "utf8");
        let sig = privKey.sign(md);
        let erg = forge.util.encode64(sig);
        result = erg;
    }

    return result
}

function utf16to8(str) {
    let out, i, len, c
    out = ''
    len = str.length
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i)
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i)
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F))
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F))
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F))
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F))
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F))
        }
    }
    return out
}

function invokeApi(options = {data: {}, server: 'interface'}) {
    const baseUrl = server[options.server].address + server[options.server].entrance
    if (!options.isFile){
        return Taro.request({
            url: baseUrl,
            data: qs.stringify(get_params(options.api, options.data, options.server,options.signType)),
            method: 'POST',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        }).then((res) => {
            const {
                statusCode,
                data
            } = res;
            if (statusCode >= 200 && statusCode < 300) {
                if (data.status !== 'ok') {
                    Taro.showModal({
                        title: '提示',
                        content:data.msg,
                        showCancel:false,
                    })
                    switch (data.code) {
                        case '30008'||'80008':
                            refreshToken(options)
                            break
                    }
                }
                return data
            } else {
                throw new Error(`网络请求错误，状态码${statusCode}`);
            }
        })
            .catch(err => {
                console.log('请求失败', err)
            })
    } else {
        delete options.data.isFile
        return Taro.uploadFile({
            url: baseUrl,
            filePath:options.data.filePath,
            name: options.data.filePath,
            formData:{
               ...get_params(options.api, options.data, options.server,options.signType)
            },
        })
            .then((res) => {
                let {
                    statusCode,
                    data
                } = res;
                if (statusCode >= 200 && statusCode < 300) {
                    data=JSON.parse(data)
                    if (data.status !== 'ok') {
                        Taro.showModal({
                            title: '提示',
                            content:data.msg,
                            showCancel:false,
                        })
                        switch (data.code) {
                            case '30008'||'80008':
                                refreshToken(options)
                                break
                        }
                    }
                    return data
                } else {
                    throw new Error(`网络请求错误，状态码${statusCode}`);
                }
            })
            .catch(err => {
                console.log('请求失败', err)
            })
    }

}

//刷新token
function refreshToken(options) {
    invokeApi({
        api: 'account.refresh',
        server:'sso',
        signType: 'sha',
        data:{
            refreshToken:Taro.getStorageSync('refresh_token')
        }
    })
        .then(res => {
            if (res.status == 'ok') {//续签成功
                Taro.setStorageSync('access_token',res.result.access_token)
                Taro.setStorageSync('refresh_token',res.result.refresh_token)
                account_customer_mini_bind()
                invokeApi(options)
            } else {//续签失败 需要重新登录
                Taro.showToast({
                    title: '失败跳转登录',
                    icon: 'none',
                    duration: 2000
                })
            }
        })
}

//绑定
function account_customer_mini_bind() {
    Taro.login()
        .then(res=>{
            if (res.code){
                Taro.setStorageSync('code',res.code)
                invokeApi({
                    api: bindApi,
                    server:'integral',
                    signType: 'sha',
                    data:{
                        code: res.code,
                        access_token: Taro.getStorageSync('access_token'),
                        refresh_token: Taro.getStorageSync('refresh_token'),
                    }
                })
                    .then(res => {
                        if (res.status == 'ok') {//续签成功
                            console.log('绑定成功')
                        }
                    })
            }
        })
}

const Request = (params) => {
    return invokeApi(params)
}

export default Request
