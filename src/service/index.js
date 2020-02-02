import Request from '../utils/request'
import {bindApi,autoLoginApi} from '../config/index'


export const sms_send = data => Request({
  api: 'sms.send',
  server:'sso',
  signType: 'rsa',
  data,
})

export const sms_check = data => Request({
  api: 'sms.check',
  server:'sso',
  signType: 'rsa',
  data,
})

export const account_customer_mini_bind = data => Request({
  api: bindApi,
  server:'integral',
  signType: 'sha',
  data,
})

export const account_customer_mini_autologin = data => Request({
  api: autoLoginApi,
  server:'integral',
  signType: 'sha',
  data,
})



