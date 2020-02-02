import Taro, {Component} from '@tarojs/taro'
import {View, Text, ScrollView, Image, Input} from '@tarojs/components'
import {AtIcon} from 'taro-ui'
import {connect} from '@tarojs/redux'
import './index.scss'

@connect(({index, common, mine, loading}) => ({
    ...index,
    ...common,
    ...mine,
    loading
}))
export default class Index extends Component {
    config = {
        navigationBarTitleText: '首页',
        enablePullDownRefresh: true,
        backgroundTextStyle: 'dark'
    }

    state = {
        flag: true
    }

    componentDidShow() {
        this.setState({
            flag: !this.state.flag
        })
        let auth_token = Taro.getStorageSync('auth_token')
        this.autologin()
        // if (!auth_token) {
        //     this.autologin()
        // } else {
        //     this.props.dispatch({
        //         type: 'mine/agentapi_runner_runner_get'
        //     })
        //     this.getAllData()
        // }
    }

    //自动登录
    autologin = () => {
        Taro.login()
            .then(res => {
                this.props.dispatch({
                    type: 'index/autologin',
                    payload: {
                        code: res.code,
                        cb: this.getAllData
                    }
                })
            })
    }

    getAllData = () => {
        this.searchTabData()
        this.getSumData()
    }

    getSumData = () => {
        this.props.dispatch({
            type: "index/agentapi_appointment_runner_statistics"
        })
    }

    changeOnline = (value) => {
        let update_info = {
            is_online: value
        }
        this.props.dispatch({
            type: 'mine/agentapi_runner_runner_update',
            payload: {
                update_info: JSON.stringify(update_info)
            }
        })
    }

    searchTabData = () => {
        const {
            currTab,
            indexTabDataMap,
            dispatch
        } = this.props
        let search_info = {
            status: currTab
        }
        dispatch({
            type: 'index/agentapi_appointment_runner_search',
            payload: {
                search_info: JSON.stringify(search_info),
                current_page: indexTabDataMap[currTab].page
            }
        })
    }

    //修改tab
    changeTab = (tab) => {
        const {
            indexTabDataMap,
            dispatch,
            currTab
        } = this.props
        // let noMore = (indexTabDataMap[tab].data.length >= indexTabDataMap[tab].total) ? true : false
        let data_length = indexTabDataMap[tab].data.length
        console.log('data_length', data_length)
        dispatch({
            type: 'index/save',
            payload: {
                currTab: tab
            }
        })
        if (data_length <= 0) {
            this.searchTabData()
        }

    }

    onReachBottom() {
        const {currTab, indexTabDataMap} = this.props
        let noMore = (indexTabDataMap[currTab].data.length >= indexTabDataMap[currTab].total) ? true : false
        if (!noMore) {
            this.searchTabData()
        }
    }

    //展开
    openRate = (i) => {
        let {
            currTab,
            indexTabDataMap,
        } = this.props
        let data_map = indexTabDataMap
        data_map[currTab].data[i].is_open = true
        data_map = JSON.stringify(data_map)
        this.props.dispatch({
            type: 'index/save',
            payload: {
                indexTabDataMap: JSON.parse(data_map)
            }
        })
    }

    //收起
    closeRate = (i) => {
        let {
            currTab,
            indexTabDataMap,
        } = this.props
        let data_map = indexTabDataMap
        data_map[currTab].data[i].is_open = false
        data_map = JSON.stringify(data_map)
        this.props.dispatch({
            type: 'index/save',
            payload: {
                indexTabDataMap: JSON.parse(data_map)
            }
        })
    }

    reset = () => {
        this.props.dispatch({
            type: 'index/save',
            payload: {
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
            }
        })
    }

    //下拉刷新
    onPullDownRefresh() {
        if (Taro.getStorageSync('auth_token')) {
            this.reset()
            this.getAllData()
        }
        setTimeout(()=>{
            Taro.stopPullDownRefresh()
        },2000)
    }

    goDetail = (id) => {
        Taro.navigateTo({
            url: '/pages/detail/index?id=' + id
        })
    }

    makePhoneCall = (phoneNumber) => {
        console.log(phoneNumber)
        Taro.makePhoneCall({
            phoneNumber
        })
    }

    render() {
        let {
            runner_info,
            currTab,
            loading,
            indexTabDataMap,
            sum_data
        } = this.props
        let auth_token = Taro.getStorageSync('auth_token')
        let hotLoading = loading.effects['index/agentapi_appointment_runner_search']
        let noMore = (indexTabDataMap[currTab].data.length >= indexTabDataMap[currTab].total) ? true : false

        runner_info = JSON.stringify(runner_info)
        runner_info = JSON.parse(runner_info)
        return (
            <View className='index-page' style={'display:' + auth_token ? 'block' : 'none'}>
                <View className="header">
                    <View className="head-img">
                        <Image src={runner_info.head_img} className='img'/>
                        <View
                            className="dot"
                            style={'background:' + (runner_info.is_online ? '#00CF8A' : '#D9D9D9') + ';'}
                        />
                    </View>
                    <View className="header-c">
                        <View className="header-c-t">
                            {runner_info.name}
                            <Text style={'color:' + (runner_info.is_online ? '#00CF8A' : '#D9D9D9') + ';'}>
                                {runner_info.is_online ? '接单中' : '已下线'}
                            </Text>
                        </View>
                        <View className="phone">{runner_info.phone}</View>
                    </View>
                    <View className="header-r">
                        <View className={runner_info.is_online ? 'btn active' : 'btn'}
                              onClick={this.changeOnline.bind(this, true)}>开始接单</View>
                        <View className={!runner_info.is_online ? 'btn active' : 'btn'}
                              onClick={this.changeOnline.bind(this, false)}>结束接单</View>
                    </View>
                </View>
                <View className="tabs">
                    <View
                        className={currTab == 'delivering' ? "tab active" : 'tab'}
                        onClick={this.changeTab.bind(this, 'delivering')}
                    >
                        进行中({sum_data.delivering_quantity || 0})
                        {currTab == 'delivering' && <View className="line"></View>}
                    </View>
                    <View
                        className={currTab == 'complete' ? "tab active" : 'tab'}
                        onClick={this.changeTab.bind(this, 'complete')}
                    >
                        已完成({sum_data.complete_quantity || 0})
                        {currTab == 'complete' && <View className="line"></View>}
                    </View>
                </View>
                {currTab == 'delivering' && (
                    <View>
                        {indexTabDataMap.delivering.data.map((item, index) => (
                            <View className="item" key={item.id}>
                                <View className="item-header">
                                    <View className="h-l">
                                        <Text>预约单号</Text>
                                        {item.number}
                                    </View>
                                    <View className="h-r">进行中</View>
                                </View>
                                <View className="consignee">
                                    <View className="consignee-t">
                                        <View className="consignee-t-l">
                                            {item.consignee}
                                            <Text>{item.phone}</Text>
                                        </View>
                                        <Image
                                            src={require('../../assets/images/call_circle.png')}
                                            onClick={this.makePhoneCall.bind(this, item.phone)}
                                            className="consignee-t-r"
                                        />
                                    </View>
                                    <View className="consignee-b">
                                        {item.address}
                                    </View>
                                </View>
                                <View className="good">
                                    <View className="good-title">
                                        <View className="good-l">
                                            <View className="label">商品名称</View>
                                            <View className="value">乐刷小蓝牙</View>
                                            <View className="number">× 1 </View>
                                        </View>
                                        {!item.is_open ? (
                                            <View className="good-r" onClick={this.openRate.bind(this, index)}>
                                                <Text>展开</Text>
                                                <AtIcon
                                                    value='chevron-down'
                                                    size='12'
                                                    color='#00CF8A'
                                                />
                                            </View>
                                        ) : (
                                            <View className="good-r" onClick={this.closeRate.bind(this, index)}>
                                                <Text>收起</Text>
                                                <AtIcon
                                                    value='chevron-up'
                                                    size='12'
                                                    color='#00CF8A'
                                                />
                                            </View>
                                        )}

                                    </View>
                                    {item.is_open == true && (
                                        <View className="good-rate">
                                            <View className="label">商品费率</View>
                                            <View className="value">0.55%+3</View>
                                        </View>
                                    )}
                                </View>
                                <View className="footer">
                                    <View className="runner-wrap">
                                        <View className="runner-info">
                                            <View className="label">预约时间</View>
                                            <View className="value">{item.appointment_create_time}</View>
                                        </View>
                                    </View>
                                    <View className="btns">
                                        <View className="btn" onClick={this.goDetail.bind(this, item.id)}>查看预约单详情</View>
                                    </View>
                                </View>
                            </View>
                        ))}
                        {hotLoading && <View className="loading">加载中...</View>}
                        {(hotLoading === false && noMore) && <View className="loading">没有更多了</View>}
                    </View>
                )}
                {currTab == 'complete' && (
                    <View>
                        {indexTabDataMap.complete.data.map((item, index) => (
                            <View className="item" key={item.id}>
                                <View className="item-header">
                                    <View className="h-l">
                                        <Text>预约单号</Text>
                                        {item.number}
                                    </View>
                                    <View className="h-r">已完成</View>
                                </View>
                                <View className="consignee">
                                    <View className="consignee-t">
                                        <View className="consignee-t-l">
                                            {item.consignee}
                                            <Text>{item.phone}</Text>
                                        </View>
                                        <Image
                                            src={require('../../assets/images/call_circle.png')}
                                            className="consignee-t-r"
                                            onClick={this.makePhoneCall.bind(this, item.phone)}
                                        />
                                    </View>
                                    <View className="consignee-b">
                                        {item.address}
                                    </View>
                                </View>
                                <View className="good">
                                    <View className="good-title">
                                        <View className="good-l">
                                            <View className="label">商品名称</View>
                                            <View className="value">乐刷小蓝牙</View>
                                            <View className="number">× 1 </View>
                                        </View>
                                        {!item.is_open ? (
                                            <View className="good-r" onClick={this.openRate.bind(this, index)}>
                                                <Text>展开</Text>
                                                <AtIcon
                                                    value='chevron-down'
                                                    size='12'
                                                    color='#00CF8A'
                                                />
                                            </View>
                                        ) : (
                                            <View className="good-r" onClick={this.closeRate.bind(this, index)}>
                                                <Text>收起</Text>
                                                <AtIcon
                                                    value='chevron-up'
                                                    size='12'
                                                    color='#00CF8A'
                                                />
                                            </View>
                                        )}

                                    </View>
                                    {item.is_open == true && (
                                        <View className="good-rate">
                                            <View className="label">商品费率</View>
                                            <View className="value">0.55%+3</View>
                                        </View>
                                    )}
                                </View>
                                <View className="footer">
                                    <View className="runner-wrap">
                                        <View className="runner-info">
                                            <View className="label">预约时间</View>
                                            <View className="value">{item.appointment_create_time}</View>
                                        </View>
                                    </View>
                                    <View className="btns">
                                        <View className="btn" onClick={this.goDetail.bind(this, item.id)}>查看预约单详情</View>
                                    </View>
                                </View>
                            </View>
                        ))}
                        {hotLoading && <View className="loading">加载中...</View>}
                        {(hotLoading === false && noMore) && <View className="loading">没有更多了</View>}
                    </View>
                )}
            </View>
        )
    }
}
