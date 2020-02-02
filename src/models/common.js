import Taro from '@tarojs/taro'
import * as commonApi from "../service/index";

let isIpx=false
if (process.env.TARO_ENV=='weapp'){
    Taro.getSystemInfo({
        success(res) {
            systemInfo = res || {}
            if (res.model.indexOf('iPhone X') > -1) {
                isIpx = true
            }
        }
    })

}
let systemInfo = {}


export default {
    namespace: 'common',

    state: {
        systemInfo: systemInfo,
        env:process.env.TARO_ENV,
        isIpx:isIpx
    },

    effects: {
        //发送短信
        * sms_send({payload}, {call, put}) {
            try {
                const {status, result} = yield call(commonApi.sms_send, payload)
                if (status == 'ok') {
                    yield put({
                        type: 'sms_check',
                        payload: {
                            mobile: '13929465780',
                            type: '4',
                            code: '111111'
                        }
                    })
                }
            } catch (e) {

            }
        },

        //验证短信
        * sms_check({payload}, {call, put}) {
            try {
                const {status, result} = yield call(commonApi.sms_check, payload)
                if (status == 'ok') {
                    Taro.setStorageSync('access_token', result.access_token)
                    Taro.setStorageSync('refresh_token', result.refresh_token)


                    //执行绑定操作
                    Taro.login()
                        .then(res => {
                            if (res.code) {
                                Taro.setStorageSync('code',res.code)
                            }
                        })
                    if (Taro.getStorageSync('code')) {
                        yield put({
                            type: 'account_customer_mini_bind',
                            payload: {
                                code: Taro.getStorageSync('code'),
                                access_token: result.access_token,
                                refresh_token: result.refresh_token,
                            }
                        })
                    }
                }
            } catch (e) {

            }
        },

        //自动登录
        * account_customer_mini_autologin({payload}, {call, put}) {
            try {
                const {status, result} = yield call(commonApi.account_customer_mini_autologin, payload)
                if (status == 'ok') {
                    if (result.access_token && result.refresh_token) {
                        Taro.setStorageSync('access_token', result.access_token)
                        Taro.setStorageSync('refresh_token', result.refresh_token)

                    } else {
                        //跳转登录
                        yield put({
                            type: 'sms_send',
                            payload: {
                                mobile: '13929465780',
                                type: '4',
                            }
                        })
                    }

                }
            } catch (e) {
                console.log(e)
            }
        },

        //绑定
        * account_customer_mini_bind({payload}, {call, put}) {
            try {
                const {status, result} = yield call(commonApi.account_customer_mini_bind, payload)
                if (status == 'ok') {

                }
            } catch (e) {

            }
        },

    },

    reducers: {
        save(state, {payload}) {
            return {...state, ...payload}
        }
    }
}
