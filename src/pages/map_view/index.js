import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import './index.scss'

@connect(({map_view,common,loading}) => ({
  ...map_view,
  ...common,
  loading
}))
export default class Map_view extends Component {
  config = {
    navigationBarTitleText: 'map_view',
  }

  componentDidMount = () => {

  }

  render() {
    const {
      } = this.props
    return (
      <View className='map_view-page'>
        map_view
      </View>
    )
  }
}
