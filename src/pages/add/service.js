import Request from '../../utils/request'

//添加安装单接口
export const agentapi_appointmentitem_runner_add = data => Request({
  api: 'agentapi.appointmentitem.runner.add',
  server:'integral',
  signType: 'sha',
  data,
})

//修改安装单接口
export const agentapi_appointmentitem_runner_update = data => Request({
  api: 'agentapi.appointmentitem.runner.update',
  server:'integral',
  signType: 'sha',
  data,
})

export const brand_search = data => Request({
  api: 'brand.search',
  server:'integral',
  signType: 'sha',
  data,
})

//上传图片
export const file_upload = data => Request({
  api: 'file.upload',
  server:'integral',
  signType: 'sha',
  isFile:true,
  data,
})

// 保存安装单接口
export const agentapi_appointmentitem_runner_preserve = data => Request({
  api: 'agentapi.appointmentitem.runner.preserve',
  server:'integral',
  signType: 'sha',
  data,
})
