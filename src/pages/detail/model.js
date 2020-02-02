import * as detailApi from './service'
import Taro from '@tarojs/taro'

export default {
    namespace: 'detail',
    state: {
        detail_data: {
            order_item_list: [],
            install_item_list: []
        },
        end_reason:''
    },

    effects: {
        //获取列表数据
        * agentapi_appointment_runner_get({payload}, {call, put, select}) {
            Taro.showLoading({mask:true})
            try {
                const {status, result} = yield call(detailApi.agentapi_appointment_runner_get, payload)
                Taro.hideLoading()
                if (status == 'ok') {
                    yield put({
                        type: 'save',
                        payload: {
                            detail_data: result.data_info
                        }
                    })
                }
            } catch (e) {
                Taro.hideLoading()
                console.log(e)
            }
        },

        //结束安装单
        * agentapi_appointment_runner_end({payload}, {call, put}) {
            try {
                const {status, result} = yield call(detailApi.agentapi_appointment_runner_end, payload)
                if (status == 'ok') {
                    Taro.navigateBack({
                        delta:1
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
