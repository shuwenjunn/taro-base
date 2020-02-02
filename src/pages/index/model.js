import * as indexApi from './service'
import Taro from "@tarojs/taro";

export default {
    namespace: 'index',
    state: {
        currTab: 'delivering',//complete
        indexTabDataMap: {
            delivering: {
                page: 1,
                data: [],
                total: 0,
            },
            complete: {
                page: 1,
                data: [],
                total: 0,
            },
        },
        sum_data:{

        }
    },

    effects: {
        //自动登录
        * autologin({payload}, {call, put}) {
            try {
                Taro.showLoading({
                    mask: true
                })
                const {status, result} = yield call(indexApi.autologin, {code: payload.code})
                Taro.hideLoading()
                if (status == 'ok') {
                    if (result.auth_token) {
                        Taro.setStorageSync('auth_token', result.auth_token)
                        yield put({
                            type: 'mine/agentapi_runner_runner_get'
                        })
                        if (payload.cb) {
                            payload.cb()
                        }
                    } else {
                        Taro.navigateTo({
                            url: '/pages/login/index'
                        })
                    }
                }
            } catch (e) {
                Taro.hideLoading()
                console.log(e)
            }
        },

        //获取列表数据
        * agentapi_appointment_runner_search({payload}, {call, put, select}) {
            try {
                const {status, result} = yield call(indexApi.agentapi_appointment_runner_search, payload)
                if (status == 'ok') {
                    let currTab = yield select(state => state.index['currTab'])
                    let indexTabDataMap = yield select(state => state.index['indexTabDataMap'])
                    indexTabDataMap[currTab].page = indexTabDataMap[currTab].page + 1
                    indexTabDataMap[currTab].data = indexTabDataMap[currTab].data.concat(result.data_list)
                    indexTabDataMap[currTab].total = result.total
                    yield put({
                        type: 'save',
                        payload: {
                            indexTabDataMap
                        }

                    })
                }
            } catch (e) {
                console.log(e)
            }
        },

        //获取统计数据
        * agentapi_appointment_runner_statistics({payload}, {call, put, select}) {
            try {
                const {status, result} = yield call(indexApi.agentapi_appointment_runner_statistics, payload)
                if (status == 'ok') {
                    yield put({
                        type: 'save',
                        payload: {
                            sum_data:result.sum_data
                        }
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
