import Taro, {Component} from '@tarojs/taro'
import {View, Text, Input, Button} from '@tarojs/components'
import {AtIcon} from 'taro-ui'
import {connect} from '@tarojs/redux'
import './index.scss'
import md5 from 'js-md5'

@connect(({login, common, loading}) => ({
    ...login,
    ...common,
    loading
}))
export default class Login extends Component {
    config = {
        navigationBarTitleText: '登录',
    }

    componentDidMount = () => {

    }

    formSubmit = (e) => {
        let payload = e.detail.value
        if (payload.username && payload.password) {
            payload.password = md5(payload.password)
            Taro.login()
                .then(res => {
                    if (res.code) {
                        payload.code = res.code
                        this.props.dispatch({
                            type: "login/login",
                            payload
                        })
                    }
                })
        } else {
            Taro.showToast({
                title: "请填写账号密码",
                icon: 'none'
            })
        }

    }

    render() {
        const {} = this.props
        return (
            <View className='login-page'>
                <View className="title">
                    欢迎使用跑单小程序
                </View>
                <Form className="form" onSubmit={this.formSubmit}>
                    <View className="form-item">
                        <View className="label">
                            <AtIcon value='user' size='18' color='#B0B0B0'></AtIcon>
                            <Text>手机号</Text>
                        </View>
                        <Input
                            placeholder='请输入手机号登录'
                            type="number"
                            placeholderClass='placeholder'
                            name="username"
                            maxLength='11'
                        />
                    </View>
                    <View className="form-item">
                        <View className="label">
                            <AtIcon value='lock' size='18' color='#B0B0B0'></AtIcon>
                            <Text>密码</Text>
                        </View>
                        <Input
                            type='password'
                            placeholder='请输入密码'
                            placeholderClass='placeholder'
                            name="password"
                        />
                    </View>
                    <Button className="btn" formType="submit">登录</Button>
                </Form>
            </View>
        )
    }
}
