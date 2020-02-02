import '@tarojs/async-await'
import {Provider} from '@tarojs/redux'
import Taro, {Component} from '@tarojs/taro'
import Index from './pages/index'
import dva from './utils/dva'
import models from './models'
import './styles/base.scss'
import './styles/custom-theme.scss'

const dvaApp = dva.createApp({
    initialState: {},
    models: models,
});
const store = dvaApp.getStore();

class App extends Component {

    config = {
        permission: {
            'scope.userLocation': {
                desc: '你的位置信息将用于小程序位置接口的效果展示'
            }
        },
        pages: [
            'pages/index/index',
            'pages/mine/index',
            'pages/login/index',
            'pages/add/index',
            'pages/detail/index',
            'pages/map_view/index',
        ],
        window: {
            backgroundTextStyle: 'light',
            navigationBarBackgroundColor: '#ffffff',
            navigationBarTitleText: '',
            navigationBarTextStyle: 'black'
        },
        "tabBar": {
            "color": "#7f8389",
            "selectedColor": "#0bad61",
            "borderStyle": "black",
            "backgroundColor": "#ffffff",
            "list": [
                {
                    "pagePath": "pages/index/index",
                    "iconPath": "assets/images/index.png",
                    "selectedIconPath": "assets/images/index_active.png",
                    "text": "首页"
                },
                {
                    "pagePath": "pages/mine/index",
                    "iconPath": "assets/images/mine.png",
                    "selectedIconPath": "assets/images/mine_active.png",
                    "text": "我的"
                }
            ]
        },
    }

    componentDidMount() {
        let ENV = process.env.TARO_ENV
        switch (ENV) {
            case 'weapp':
                this.weappLogin()
                Taro.setStorageSync('clientType', '3')
                Taro.setStorageSync('platform', '0')
                break
            case 'web':
                this.weappLogin()
                Taro.setStorageSync('clientType', '3')
                Taro.setStorageSync('platform', '0')
                break
        }
    }


    componentDidShow() {

    }

    //微信小程序登录
    weappLogin = () => {
        Taro.login()
            .then(res => {
                if (res.code) {
                    // dvaApp.dispatch({
                    //   type: 'common/account_customer_mini_autologin',
                    //   payload: {
                    //      code:res.code
                    //   }
                    // })
                    // dvaApp.dispatch({
                    //   type: 'common/sms_send',
                    //   payload: {
                    //       mobile: '15527377390',
                    //       type: '4'
                    //   }
                    // })
                }
            })
    }


    render() {
        return (
            <Provider store={store}>
                <Index/>
            </Provider>
        )
    }
}

Taro.render(<App/>, document.getElementById('app'))
