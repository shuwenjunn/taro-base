import * as addApi from './service'
import Taro from '@tarojs/taro'

export default {
    namespace: 'add',
    state: {
        goods_name: '',//char # 商品名称
        goods_code: '',// char # 商品编码
        brand_label: '',// char # 设备品牌
        sn_code: '',//char # 设备编码
        merchant_name: '',// char # 注册商户
        merchant_sn: '',// char # 商户编码
        merchant_phone: '',// char # 商户手机号
        bind_voucher: [],// char # 绑定凭证
        transaction_voucher: [],// char # 流水凭证
        is_submit: '',// boolean # 是否提交
        all_good: [],//所有商品
        all_brand: [],//所有品牌
        before_data: {}
    },

    effects: {
        //添加安装单
        * agentapi_appointmentitem_runner_add({payload}, {call, put, select}) {
            try {
                Taro.showLoading({
                    mask: true
                })
                const {status, result} = yield call(addApi.agentapi_appointmentitem_runner_add, payload)
                Taro.hideLoading()

                if (status == 'ok') {
                    yield put({
                        type:"detail/agentapi_appointment_runner_get",
                        payload:{
                            agent_appointment_id:payload.agent_appointment_id
                        }
                    })
                    Taro.navigateBack({delta:1})
                }
            } catch (e) {
                Taro.hideLoading()
                console.log(e)
            }
        },

        //修改安装单
        * agentapi_appointmentitem_runner_update({payload}, {call, put, select}) {
            try {
                Taro.showLoading({
                    mask: true
                })
                const {status, result} = yield call(addApi.agentapi_appointmentitem_runner_update, {appointment_item_number:payload.appointment_item_number,data_info:payload.data_info})
                Taro.hideLoading()
                if (status == 'ok') {
                    yield put({
                        type:"detail/agentapi_appointment_runner_get",
                        payload:{
                            agent_appointment_id:payload.agent_appointment_id
                        }
                    })
                    Taro.navigateBack({delta:1})
                }
            } catch (e) {
                Taro.hideLoading()
                console.log(e)
            }
        },

        //查询所有品牌
        * brand_search({payload}, {call, put, select}) {
            try {
                const {status, result} = yield call(addApi.brand_search, payload)
                if (status == 'ok') {
                    yield put({
                        type: 'save',
                        payload: {
                            all_brand: result.data_list
                        }
                    })
                    let all_brand = result.data_list
                    let before_data = yield select(state => state.add['before_data'])
                    console.log(before_data,all_brand)
                    for (let i in all_brand) {
                        if (before_data.brand_label == all_brand[i].label) {
                            yield put({
                                type:'save',
                                payload:{
                                    brand_label:i+''
                                }
                            })
                        }
                    }
                }
            } catch (e) {
                console.log(e)
            }
        },

        * file_upload({payload}, {call, put, select}) {
            try {
                const {status, result} = yield call(addApi.file_upload, payload)
                if (status == 'ok') {
                    console.log('payload.type', payload)
                    if (payload.store_type == 'bind_voucher') {
                        let bind_voucher = yield select(state => state.add['bind_voucher'])
                        let newFile = [result.imgurl]
                        yield put({
                            type: 'save',
                            payload: {
                                bind_voucher: bind_voucher.concat(newFile)
                            }
                        })
                    } else {
                        let transaction_voucher = yield select(state => state.add['transaction_voucher'])
                        let newFile = [result.imgurl]
                        yield put({
                            type: 'save',
                            payload: {
                                transaction_voucher: transaction_voucher.concat(newFile)
                            }
                        })
                    }
                }
            } catch (e) {
                console.log('errr', e)
            }
        },

        //保存 安装单id
        * agentapi_appointmentitem_runner_preserve({payload}, {call, put, select}) {
            try {
                Taro.showLoading({mask: true})
                const {status, result} = yield call(addApi.agentapi_appointmentitem_runner_preserve, payload)
                Taro.hideLoading()
                if (status == 'ok') {
                    yield put({
                        type:"detail/agentapi_appointment_runner_get",
                        payload:{
                            agent_appointment_id:payload.agent_appointment_id
                        }
                    })
                    Taro.navigateBack({delta:1})
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
