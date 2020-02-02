import * as mineApi from './service'
import Taro from "@tarojs/taro";

export default {
    namespace: 'mine',
    state: {
        runner_info: {}
    },

    effects: {
        * agentapi_runner_runner_get({payload}, {call, put}) {
            try {
                const {status, result} = yield call(mineApi.agentapi_runner_runner_get, payload)
                if (status == 'ok') {
                    yield put({
                        type: 'save',
                        payload: {
                            runner_info: result.runner_info
                        }
                    })
                }
            } catch (e) {
                console.log(e)
            }
        },

        //更新上下线和头像
        * agentapi_runner_runner_update({payload}, {call, put}) {
            try {
                Taro.showLoading({
                    mask: true
                })
                const {status, result} = yield call(mineApi.agentapi_runner_runner_update, payload)
                Taro.hideLoading()
                if (status == 'ok') {
                    yield put({
                        type:'agentapi_runner_runner_get'
                    })
                }
            } catch (e) {
                Taro.hideLoading()
                console.log(e)
            }
        },

        //退出登录
        * agentapi_account_runner_logout({payload}, {call, put}) {
            try {
                const {status, result} = yield call(mineApi.agentapi_account_runner_logout, payload)
                if (status == 'ok') {
                    yield put({
                        type: 'save',
                        payload: {
                            runner_info: {}
                        }
                    })
                    Taro.clearStorageSync()
                    Taro.navigateTo({
                        url: '/pages/login/index'
                    })
                }
            } catch (e) {
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
