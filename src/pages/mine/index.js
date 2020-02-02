import Taro, {Component} from '@tarojs/taro'
import {Text, View, Image, Button} from '@tarojs/components'
import {AtIcon} from 'taro-ui'
import {connect} from '@tarojs/redux'
import './index.scss'

@connect(({mine, common, loading}) => ({
    ...mine,
    ...common,
    loading
}))
export default class Mine extends Component {
    config = {
        navigationBarTitleText: '我的',
    }

    componentDidMount = () => {

    }

    componentDidShow() {
        let auth_token=Taro.getStorageSync('auth_token')
        if(!auth_token){
            Taro.navigateTo({
                url:'/pages/login/index'
            })
        }
    }

    exit = () => {
        Taro.showActionSheet({
            itemList: ['退出登录'],
            itemColor: "#E4372D"
        })
            .then(res => {
                if (res.tapIndex == 0) {
                    this.props.dispatch({
                        type: 'mine/agentapi_account_runner_logout',
                    })
                }
            })
            .catch(err => console.log(err.errMsg))
    }

    onGetUserInfo = (e) => {
        if (e.detail.errMsg == 'getUserInfo:ok') {
            let update_info = {
                head_img: e.detail.userInfo.avatarUrl
            }
            this.props.dispatch({
                type: 'mine/agentapi_runner_runner_update',
                payload: {
                    update_info: JSON.stringify(update_info)
                }
            })
        }
    }

    render() {
        const {runner_info} = this.props
        let auth_token=Taro.getStorageSync('auth_token')
        return (
            <View className='mine-page' style={'display:'+auth_token?'block':'none'}>
                <View className="header">
                    <Image src={runner_info.head_img} className="head-img"/>
                    <View className="header-c">
                        <View className="header-c-t">
                            {runner_info.name}
                            <Button
                                openType="getUserInfo"
                                className="get-head-img"
                                onGetUserInfo={this.onGetUserInfo.bind(this)}
                            >
                                同步头像
                            </Button>
                        </View>
                        <View className="phone">{runner_info.phone}</View>
                    </View>
                </View>

                <View className="info">
                    <View className="info-it">
                        <View className="label">工号</View>
                        <View className="value">{runner_info.number||''}</View>
                    </View>
                    <View className="info-it">
                        <View className="label">身份证号</View>
                        <View className="value">{runner_info.identity||''}</View>
                    </View>
                    <View className="info-it">
                        <View className="label">性别</View>
                        <View className="value">{runner_info.gender}</View>
                    </View>
                    <View className="info-it">
                        <View className="label">邮箱</View>
                        <View className="value">{runner_info.email}</View>
                    </View>
                </View>

                <View className="exit" onClick={this.exit}>
                    <Image className='icon' src={require('../../assets/images/exit.png')}/>
                    <View className="desc">退出登录</View>
                    <AtIcon value='chevron-right' size='30' color='#E2E2E2'></AtIcon>
                </View>
            </View>
        )
    }
}
