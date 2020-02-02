import Request from '../../utils/request'

export const login = data => Request({
  api: 'agentapi.account.runner.login',
  server:'integral',
  signType: 'sha',
  data,
})
