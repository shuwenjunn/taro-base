import Taro, {Component} from '@tarojs/taro'
import {Text, View, Image, Form, Input} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import './index.scss'
import {AtIcon, AtButton, AtFloatLayout} from 'taro-ui'

var QQMapWX = require('../../assets/libs/qqmap-wx-jssdk.min');
var qqmapsdk = new QQMapWX({key: 'FQMBZ-AY53X-4FV45-ZR65B-CA36T-EWBZM'})
@connect(({detail, common, loading}) => ({
    ...detail,
    ...common,
    loading
}))
export default class Detail extends Component {
    config = {
        navigationBarTitleText: '详情',
    }

    state = {
        endModalVisible: false,
        openRate: false
    }

    componentDidMount = () => {
        this.agentapi_appointment_runner_get()
    }

    componentWillUnmount() {
        this.reset()
    }

    toggleEndModal = () => {
        this.setState({
            endModalVisible: !this.state.endModalVisible,
        })
        this.props.dispatch({
            type: 'detail/save',
            payload: {
                end_reason: ''
            }
        })
    }

    agentapi_appointment_runner_get = () => {
        this.props.dispatch({
            type: 'detail/agentapi_appointment_runner_get',
            payload: {
                agent_appointment_id: this.$router.params.id
            }
        })
    }

    makePhoneCall = (phoneNumber) => {
        console.log(phoneNumber)
        Taro.makePhoneCall({
            phoneNumber
        })
    }

    goMap = (name) => {
        // Taro.navigateTo({
        //     url: '/pages/map_view/index'
        // })
        if (Taro.getStorageSync('loaction_keyword') == name) {
            console.log('缓存')
            let location = JSON.parse(Taro.getStorageSync('loaction_data'))
            Taro.openLocation({
                longitude: location.lng,
                latitude: location.lat,
                name: name,
                address: name
            })
                .then(res => {
                    console.log(res)
                })
        } else {
            console.log('读取缓存')
            qqmapsdk.search({
                keyword: name,
                success: function (res) {
                    if (res && res.data.length > 0) {
                        let location = res.data[0].location
                        Taro.setStorageSync('loaction_keyword', name)
                        Taro.setStorageSync('loaction_data', JSON.stringify(location))
                        console.log(location)
                        Taro.openLocation({
                            // longitude:res.longitude,
                            // latitude:res.latitude,
                            longitude: location.lng,
                            latitude: location.lat,
                            name: name,
                            address: name
                        })
                            .then(res => {
                                console.log(res)
                            })
                    }
                },
                fail: function (res) {
                    console.log(res);
                },
                complete: function (res) {
                    console.log(res);
                }
            })
        }


        // Taro.getLocation({
        //     type: 'gcj02',
        //     altitude:true,
        // })
        //     .then(res=>{
        //         console.log(res)
        //         Taro.openLocation({
        //             // longitude:res.longitude,
        //             // latitude:res.latitude,
        //             longitude:114.454593,
        //             latitude:30.45948,
        //             name:name,
        //             address:name
        //         })
        //             .then(res=>{
        //                 console.log(res)
        //             })
        //     })
    }

    openRate = () => {
        this.setState({
            openRate: true
        })
    }

    closeRate = () => {
        this.setState({
            openRate: false
        })
    }

    //跳转添加
    goAdd = (data) => {
        Taro.navigateTo({
            url: '/pages/add/index?data=' + JSON.stringify(data)
        })
    }

    //结束
    end = () => {
        const {end_reason, detail_data} = this.props
        if (!end_reason) {
            Taro.showToast({
                title: '请填写结束理由',
                icon: 'none'
            })
            return
        }
        let data_info = {
            end_reason
        }
        this.props.dispatch({
            type: 'detail/agentapi_appointment_runner_end',
            payload: {
                agent_appointment_id: detail_data.id,
                data_info: JSON.stringify(data_info)
            }
        })
    }

    onChange = (e) => {
        const {value} = e.detail
        const key = e.target.id
        this.props.dispatch({
            type: 'detail/save',
            payload: {
                [`${key}`]: value,
            }
        })
    }

    //重置页面数据
    reset = () => {
        this.props.dispatch({
            type: "detail/save",
            payload: {
                end_reason: ""
            }
        })
    }

    onPreviewImage = (current, urls) => {
        Taro.previewImage({
            current: current, // 当前显示图片的http链接
            urls: JSON.parse(urls) // 需要预览的图片http链接列表
        })
    }

    render() {
        const {
            isIpx,
            detail_data,
            end_reason
        } = this.props
        const {install_item_list} = detail_data
        const {endModalVisible, openRate} = this.state
        let map = {
            leshua: '乐刷',
            dianshua: "点刷",
            yinshoubao: '银收宝',
            lakala: '拉卡拉'
        }
        return (
            <View className='detail-page'>
                <Form className="info">
                    <View className="item-header">
                        <View className="h-l">
                            <Text>预约单号</Text>
                            {detail_data.number}
                        </View>
                        <View className="h-r">
                            {detail_data.status == 'delivering' ? (
                                <Text style='color:#D9D9D9'>进行中</Text>
                            ) : (
                                <Text style='color:#D9D9D9'>已完成</Text>
                            )}</View>
                    </View>
                    <View className="consignee">
                        <View className="sub-title">
                            顾客信息
                        </View>
                        <View className="consignee-t">
                            <View className="consignee-t-l">
                                {detail_data.consignee}
                                <Text>{detail_data.phone}</Text>
                            </View>
                        </View>
                        <View className="consignee-b">
                            {detail_data.address}
                        </View>
                        <View className="btns">
                            <View className="btn" onClick={this.makePhoneCall.bind(this, detail_data.phone)}>
                                <AtIcon value='phone' size='20' color='#00CF8A'></AtIcon>
                                <Text>联系顾客</Text>
                            </View>
                            <View className="btn" onClick={this.goMap.bind(this, detail_data.address)}>
                                <AtIcon value='map-pin' size='20' color='#00CF8A'></AtIcon>
                                <Text>查看地图</Text>
                            </View>
                        </View>
                    </View>
                    <View className="goods">
                        <View className="sub-title">
                            商品
                        </View>
                        {detail_data.order_item_list.map((item, index) => (
                            <View className="good" key={index}>
                                <View className="good-title">
                                    <View className="good-l">
                                        <View className="label">商品名称</View>
                                        <View className="value">{item.goods_name}</View>
                                        <View className="number">× {item.quantity}</View>
                                    </View>
                                    {!openRate ? (
                                        <View className="good-r" onClick={this.openRate}>
                                            <Text>展开</Text>
                                            <AtIcon
                                                value='chevron-down'
                                                size='16'
                                                color='#00CF8A'
                                                className='chevron-right'
                                            />
                                        </View>
                                    ) : (
                                        <View className="good-r" onClick={this.closeRate}>
                                            <Text>收起</Text>
                                            <AtIcon
                                                value='chevron-up'
                                                size='16'
                                                color='#00CF8A'
                                                className='chevron-right'
                                            />
                                        </View>
                                    )}

                                </View>
                                {openRate && (
                                    <View className="good-rate">
                                        <View className="label">商品费率</View>
                                        <View className="value">{item.rate}</View>
                                    </View>
                                )}
                            </View>
                        ))}

                    </View>

                    {/*结束信息*/}
                    {detail_data.end_reason && (
                        <View className="end-wrapper">
                            <View className="sub-title">
                                结束信息
                            </View>
                            <View className="item">
                                <View className="label">结束理由</View>
                                <View className="value">{detail_data.end_reason}</View>
                            </View>
                            <View className="item">
                                <View className="label">结束时间</View>
                                <View className="value">{detail_data.end_time}</View>
                            </View>
                        </View>
                    )}


                    {/*安装信息*/}
                    {install_item_list.length > 0 && (
                        <View className="install-wrapper">
                            <View className="sub-title">
                                安装信息
                            </View>
                            {install_item_list.map((item, index) => (
                                <View key={index}>
                                    <View className="item">
                                        <View className="label">安装单号</View>
                                        <View className="value">{item.number}</View>
                                        {item.status == 'wait_submit' && (
                                            <View className="edit" onClick={this.goAdd.bind(this, item)}>编辑</View>)}
                                        {(item.status == 'fail' && !detail_data.end_reason) && (
                                            <View className="edit" onClick={this.goAdd.bind(this, item)}>重新提交</View>)}
                                    </View>
                                    <View className="item">
                                        <View className="label">安装状态</View>
                                        <View className="value">
                                            {item.status == 'wait_submit' && <Text style='color:#FF9E00;'>未提交</Text>}
                                            {item.status == 'wait_audit' && <Text style='color:#00CF8A;'>待审核</Text>}
                                            {item.status == 'pass' && <Text style='color:#00CF8A;'>通过</Text>}
                                            {item.status == 'fail' && <Text style='color:#FF9E00;'>审核失败</Text>}

                                        </View>
                                    </View>
                                    <View className="item">
                                        <View className="label">安装时间</View>
                                        <View className="value">{item.create_time || ''}</View>
                                    </View>
                                    <View className="item">
                                        <View className="label">审核时间</View>
                                        <View className="value">{item.record_time || ''}</View>
                                    </View>
                                    <View className="item">
                                        <View className="label">设备品牌</View>
                                        <View className="value">{map[item.brand_label]}</View>
                                    </View>
                                    <View className="item">
                                        <View className="label">设备编码</View>
                                        <View className="value">{item.sn_code}</View>
                                    </View>
                                    <View className="item">
                                        <View className="label">注册商户</View>
                                        <View className="value">{item.merchant_name}</View>
                                    </View>
                                    <View className="item">
                                        <View className="label">注册手机</View>
                                        <View className="value">{item.merchant_phone}</View>
                                    </View>
                                    <View className="item">
                                        <View className="label">商户编码</View>
                                        <View className="value">{item.merchant_sn}</View>
                                    </View>
                                    <View className="item img-item">
                                        <View className="label">绑定凭证</View>
                                        <View className="value">
                                            {item.bind_voucher && JSON.parse(item.bind_voucher).map((it, idx) => (
                                                <Image
                                                    src={it}
                                                    key={idx}
                                                    onClick={this.onPreviewImage.bind(this, it, item.bind_voucher)}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                    <View className="item img-item" style='margin-top:12px;'>
                                        <View className="label">流水凭证</View>
                                        <View className="value">
                                            {item.transaction_voucher && JSON.parse(item.transaction_voucher).map((it, idx) => (
                                                <Image
                                                    src={it}
                                                    key={idx}
                                                    onClick={this.onPreviewImage.bind(this, it, item.transaction_voucher)}
                                                />
                                            ))}
                                        </View>

                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/*预约时间*/}
                    <View className="runner-wrap">
                        <View className="runner-info">
                            <View className="label">预约时间</View>
                            <View className="value">{detail_data.appointment_create_time}</View>
                        </View>
                    </View>
                </Form>
                <AtFloatLayout
                    isOpened={endModalVisible}
                    className='end-modal'
                    onClose={this.toggleEndModal}
                >
                    <View className="title">
                        <View></View>
                        <View>结束安装</View>
                        <AtIcon
                            value='close'
                            size='16'
                            color='#999999'
                            onClick={this.toggleEndModal}
                        />
                    </View>
                    <View className="form-it">
                        <View className="label">结束理由</View>
                        <Input
                            className="value"
                            placeholder={'请填写结束理由'}
                            value={end_reason}
                            id='end_reason'
                            onChange={this.onChange.bind(this)}
                        />
                    </View>
                    <View className="btn-wrap">
                        <AtButton
                            className='btn'
                            size="normal"
                            type="secondary"
                            circle
                            onClick={this.end.bind(this)}
                        >
                            结束安装
                        </AtButton>
                    </View>
                </AtFloatLayout>

                {(detail_data.status != 'complete') && (
                    <View className="footer-wrapper">
                        <View className="footer">
                            <View className="footer-l">
                                待安装
                                <Text>x{detail_data.wait_submit_quantity}</Text>
                            </View>
                            <View className="footer-r">
                                <AtButton className='btn' size={'small'} circle onClick={this.toggleEndModal}>
                                    <Text style="color:#666;">结束安装</Text>
                                </AtButton>
                                {detail_data.wait_submit_quantity > 0 && (
                                    <AtButton
                                        className='btn'
                                        size={'small'}
                                        onClick={this.goAdd.bind(this, {})}
                                        type="secondary"
                                        circle
                                    >
                                        添加安装单
                                    </AtButton>
                                )}
                            </View>
                        </View>
                        {isIpx && <View className="blank"></View>}
                    </View>
                )}
            </View>
        )
    }
}
