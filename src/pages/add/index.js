import Taro, {Component} from '@tarojs/taro'
import {View, Form, Text, Picker, Input, CoverView, Button, Image} from '@tarojs/components'
import {connect} from '@tarojs/redux'
import './index.scss'
import {AtButton, AtIcon} from "taro-ui";

@connect(({add, common, detail, loading}) => ({
    ...add,
    ...common,
    ...detail,
    loading
}))
export default class Add extends Component {
    config = {
        navigationBarTitleText: '添加安装单',
    }

    componentDidMount = () => {
        const {detail_data} = this.props
        let all_good = detail_data.order_item_list
        this.brand_search()
        let before_data = JSON.parse(this.$router.params.data)
        let bind_voucher = []
        let transaction_voucher = []
        if (before_data.bind_voucher && JSON.parse(before_data.bind_voucher).length > 0) {
            bind_voucher = JSON.parse(before_data.bind_voucher)
        }
        if (before_data.transaction_voucher && JSON.parse(before_data.transaction_voucher).length > 0) {
            transaction_voucher = JSON.parse(before_data.transaction_voucher)
        }
        console.log('before_data', before_data)
        //设置默认的商品 和品牌
        let goods_code = ''
        if (before_data.goods_code) {
            for (let i in all_good) {
                if (all_good[i].goods_code == before_data.goods_code) {
                    goods_code = i + ''
                    break
                }
            }
        }

        this.props.dispatch({
            type: 'add/save',
            payload: {
                all_good,
                before_data: before_data,
                transaction_voucher: transaction_voucher,
                bind_voucher: bind_voucher,
                goods_code: goods_code,

                sn_code: before_data.sn_code,//char # 设备编码
                merchant_name: before_data.merchant_name,// char # 注册商户
                merchant_sn: before_data.merchant_sn,// char # 商户编码
                merchant_phone: before_data.merchant_phone,// char # 商户手机号
            }
        })
    }

    componentWillUnmount() {
        this.reset()
    }

    //获取所有品牌
    brand_search = () => {
        this.props.dispatch({
            type: "add/brand_search"
        })
    }

    //扫一扫
    scanSn = () => {
        Taro.scanCode()
            .then(res => {
                this.props.dispatch({
                    type: 'add/save',
                    payload: {
                        sn_code: res.result
                    }
                })
            })
            .catch(e => {
                if (e.errMsg === 'scanCode:fail') {
                    console.log('扫描失败')
                }
            })
    }

    onChange = (e) => {
        const {value} = e.detail
        const key = e.target.id
        this.props.dispatch({
            type: 'add/save',
            payload: {
                [`${key}`]: value,
            }
        })
    }

    //submit

    onSubmit = (is_submit) => {
        const {
            detail_data,
            goods_name,//char # 商品名称
            goods_code,// char # 商品编码
            brand_label,// char # 设备品牌
            sn_code,//char # 设备编码
            merchant_name,// char # 注册商户
            merchant_sn,// char # 商户编码
            merchant_phone,// char # 商户手机号
            bind_voucher,// char # 绑定凭证
            transaction_voucher,// char # 流水凭证
            dispatch,
            all_good,
            before_data,
            all_brand
        } = this.props
        if (is_submit) {//是否提交
            if (!goods_code) {
                Taro.showToast({
                    title: "请选择商品",
                    icon: 'none'
                })
                return
            }
            if (!brand_label) {
                Taro.showToast({
                    title: "请选择品牌",
                    icon: 'none'
                })
                return
            }
            if (!sn_code) {
                Taro.showToast({
                    title: "请扫码设备编码",
                    icon: 'none'
                })
                return
            }
            if (!merchant_phone) {
                Taro.showToast({
                    title: "请填写注册手机",
                    icon: 'none'
                })
                return
            }
            //验证手机号是否正确
            var phoneReg = /(^1\d{10}$)/;
            if (!phoneReg.test(merchant_phone)) {
                Taro.showToast({
                    title: "手机号格式错误",
                    icon: 'none'
                })
                return
            }
            if (bind_voucher.length <= 0) {
                Taro.showToast({
                    title: "请上传绑定凭证",
                    icon: 'none'
                })
                return
            }
            if (transaction_voucher.length <= 0) {
                Taro.showToast({
                    title: "请上传流水凭证",
                    icon: 'none'
                })
                return
            }
        }


        // if (!merchant_name) {
        //     Taro.showToast({
        //         title: "请填写注册商户名称",
        //         icon: 'none'
        //     })
        //     return
        // }
        // if (!merchant_sn) {
        //     Taro.showToast({
        //         title: "请填写商户编码",
        //         icon: 'none'
        //     })
        //     return
        // }

        let data_info = {
            goods_name:goods_code? all_good[goods_code * 1].goods_name:'',
            goods_code:goods_code? all_good[goods_code * 1].goods_code:'',
            brand_label:brand_label? all_brand[brand_label * 1].label:'',
            sn_code,
            merchant_name,
            merchant_sn,
            merchant_phone,
            bind_voucher: JSON.stringify(bind_voucher),
            transaction_voucher: JSON.stringify(transaction_voucher),
        }

        for (let key in data_info) {
            if (data_info[key] === '') {
                delete data_info[key]
            }
        }

        //需要判断是添加还是编辑
        if (this.$router.params.data == '{}') {//添加
            if (is_submit) {//添加并且提交
                dispatch({
                    type: "add/agentapi_appointmentitem_runner_add",
                    payload: {
                        agent_appointment_id: detail_data.id,
                        data_info: JSON.stringify(data_info)
                    }
                })
            } else {//添加保存
                dispatch({
                    type: "add/agentapi_appointmentitem_runner_preserve",
                    payload: {
                        agent_appointment_id: detail_data.id,
                        data_info: JSON.stringify(data_info)
                    }
                })
            }

        } else {//编辑
            if (is_submit) {
                dispatch({
                    type: "add/agentapi_appointmentitem_runner_update",
                    payload: {
                        appointment_item_number: before_data.number,
                        agent_appointment_id: detail_data.id,
                        data_info: JSON.stringify(data_info)
                    }
                })
            } else {
                data_info.appointment_item_number=before_data.number
                dispatch({
                    type: "add/agentapi_appointmentitem_runner_preserve",
                    payload: {
                        agent_appointment_id: detail_data.id,
                        data_info: JSON.stringify(data_info)
                    }
                })
            }

        }

    }

    //上传图片
    onChooseImage = (type) => {
        console.log('type', type)
        Taro.chooseImage({
            count: 1,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
        })
            .then(res => {
                let filePath = res.tempFilePaths[0]
                this.props.dispatch({
                    type: 'add/file_upload',
                    payload: {
                        filePath: filePath,
                        store_type: type,
                    }
                })
            })
    }

    onPreviewImage = (current, type) => {
        const {bind_voucher, transaction_voucher} = this.props
        let urls = []
        if (type == 'bind_voucher') {
            urls = bind_voucher
        } else {
            urls = transaction_voucher
        }
        Taro.previewImage({
            current: current, // 当前显示图片的http链接
            urls: urls // 需要预览的图片http链接列表
        })
    }

    onRemoveImg = (index, type) => {
        const {bind_voucher, transaction_voucher} = this.props
        let urls = []
        if (type == 'bind_voucher') {
            urls = bind_voucher
        } else {
            urls = transaction_voucher
        }
        urls.splice(index, 1)
        urls = JSON.stringify(urls)
        this.props.dispatch({
            type: 'add/save',
            payload: {
                [`${type == 'bind_voucher' ? 'bind_voucher' : 'transaction_voucher'}`]: JSON.parse(urls)
            }
        })
    }

    //重置页面数据
    reset = () => {
        this.props.dispatch({
            type: "add/save",
            payload: {
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
            }
        })
    }

    render() {
        const {
            isIpx,
            goods_name,//char # 商品名称
            goods_code,// char # 商品编码
            brand_label,// char # 设备品牌
            sn_code,//char # 设备编码
            merchant_name,// char # 注册商户
            merchant_sn,// char # 商户编码
            merchant_phone,// char # 商户手机号
            bind_voucher,// char # 绑定凭证
            transaction_voucher,// char # 流水凭证
            detail_data,
            all_brand,//所有品牌
            all_good,//所有商品
            before_data,
        } = this.props

        return (
            <View className='add-page'>
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
                    </View>
                    <View className="form-wrapper">
                        <View className="sub-title">
                            安装商品
                        </View>
                        <View className="form-item">
                            <View className="label">
                                商品名称
                            </View>
                            <Picker
                                className={goods_code ? 'con value' : 'con placeholder'}
                                id='goods_code'
                                onChange={this.onChange.bind(this)}
                                range={all_good}
                                rangeKey='goods_name'
                            >
                                {goods_code ? (all_good[goods_code * 1].goods_name) : '请选择要安装的商品'}
                            </Picker>
                            <AtIcon value='chevron-down' size='24' color='#c4c4c7'></AtIcon>
                        </View>
                    </View>

                    <View className="form-wrapper">
                        <View className="sub-title">
                            设备信息
                        </View>
                        <View className="form-item">
                            <View className="label">
                                设备品牌
                            </View>
                            <Picker
                                className={brand_label ? 'con value' : 'con placeholder'}
                                id='brand_label'
                                onChange={this.onChange.bind(this)}
                                range={all_brand}
                                rangeKey='value'
                            >
                                {brand_label ? all_brand[brand_label * 1].value : '请选择设备品牌'}
                            </Picker>
                            <AtIcon value='chevron-down' size='24' color='#c4c4c7'></AtIcon>
                        </View>
                        <View className="form-item">
                            <View className="label">
                                设备编码
                            </View>
                            <Input
                                className='con value'
                                placeholderClass='placeholder'
                                placeholder='点击扫码，可输入'
                                value={sn_code}
                                id='sn_code'
                                maxLength={20}
                                onInput={this.onChange.bind(this)}
                            />
                            <Image
                                onClick={this.scanSn}
                                src={require('../../assets/images/saoyisao.png')}
                                style={'width:22px;height:22px;display:block;'}
                            />
                        </View>
                    </View>

                    <View className="form-wrapper">
                        <View className="sub-title">
                            注册信息
                        </View>
                        <View className="form-item">
                            <View className="label">
                                注册商户
                            </View>
                            <Input
                                className='con value'
                                placeholderClass='placeholder'
                                placeholder='请填写顾客注册商户名称'
                                value={merchant_name}
                                id='merchant_name'
                                maxLength={10}
                                onInput={this.onChange.bind(this)}
                            />
                        </View>
                        <View className="form-item">
                            <View className="label">
                                注册手机
                            </View>
                            <Input
                                className='con value'
                                placeholderClass='placeholder'
                                placeholder='请填写顾客注册手机号'
                                value={merchant_phone}
                                id='merchant_phone'
                                onInput={this.onChange.bind(this)}
                                type="number"
                                maxLength={11}
                            />
                        </View>
                        <View className="form-item">
                            <View className="label">
                                商户编码
                            </View>
                            <Input
                                className='con value'
                                placeholderClass='placeholder'
                                placeholder='请填写商户注册唯一编码'
                                value={merchant_sn}
                                id='merchant_sn'
                                onInput={this.onChange.bind(this)}
                                maxLength={20}
                            />
                        </View>
                    </View>

                    <View className="form-wrapper">
                        <View className="sub-title">
                            凭证信息
                        </View>
                        <View className="form-item upload-form" style='margin-bottom:28px;'>
                            <View className="label">
                                绑定凭证
                            </View>
                            <View className="con">

                                {(bind_voucher.map((item, index) => (
                                    <View className='image' key={index}>
                                        <View
                                            className='remove'
                                            onClick={this.onRemoveImg.bind(this, index, 'bind_voucher')}
                                        >
                                            <Image src={require('../../assets/images/close.png')}/>
                                        </View>
                                        <Image
                                            src={item}
                                            onClick={this.onPreviewImage.bind(this, item, 'bind_voucher')}
                                        />
                                    </View>
                                )))}
                                {bind_voucher.length < 2 && (
                                    <View
                                        className='upload'
                                        onClick={this.onChooseImage.bind(this, 'bind_voucher')}
                                    >
                                        <View className='heng'></View>
                                        <View className='shu'></View>
                                    </View>
                                )}
                            </View>
                        </View>
                        <View className="form-item upload-form">
                            <View className="label">
                                流水凭证
                            </View>
                            <View className="con">
                                {(transaction_voucher.map((item, index) => (
                                    <View className='image' key={index}>
                                        <View
                                            className='remove'
                                            onClick={this.onRemoveImg.bind(this, index, 'transaction_voucher')}
                                        >
                                            <Image src={require('../../assets/images/close.png')}/>
                                        </View>
                                        <Image
                                            src={item}
                                            onClick={this.onPreviewImage.bind(this, item, 'transaction_voucher')}
                                        />
                                    </View>
                                )))}
                                {transaction_voucher.length < 2 && (
                                    <View
                                        className='upload'
                                        onClick={this.onChooseImage.bind(this, 'transaction_voucher')}
                                    >
                                        <View className='heng'></View>
                                        <View className='shu'></View>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </Form>

                <CoverView className="footer-wrapper">
                    <CoverView className="footer">
                        <CoverView className="footer-l">
                        </CoverView>
                        <CoverView className="footer-r">
                            {before_data.status!=='fail'&&(
                                <Button className='btn' onClick={this.onSubmit.bind(this, false)}>
                                    保存
                                </Button>
                            )}
                            <Button className='btn' onClick={this.onSubmit.bind(this, true)}>提交审核</Button>
                        </CoverView>
                    </CoverView>
                    {isIpx && <CoverView className="blank"></CoverView>}
                </CoverView>

            </View>
        )
    }
}
