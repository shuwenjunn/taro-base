import * as loginApi from './service'
import Taro from "@tarojs/taro";

export default {
    namespace: 'login',
    state: {},

    effects: {
        * login({payload}, {call, put}) {
            try {
                Taro.showLoading({
                    mask: true
                })
                const {status, result} = yield call(loginApi.login, payload)
                Taro.hideLoading()
                if (status == 'ok') {
                    if (result.auth_token) {
                        Taro.setStorageSync('auth_token', result.auth_token)
                        Taro.switchTab({
                            url: '/pages/index/index'
                        })
                        //获取个人信息和获取首页数据
                        yield put({
                            type:'mine/agentapi_runner_runner_get'
                        })
                    }
                }
            } catch (e) {
                Taro.hideLoading()
                console.log(e)
            }
        },
    },

    reducers: {
        save(state, {payload}) {
            return {...state, ...payload}
        },
    },

}
