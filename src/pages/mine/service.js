import Request from '../../utils/request'

export const agentapi_runner_runner_get = data => Request({
  api: 'agentapi.runner.runner.get',
  server:'integral',
  signType: 'sha',
  data,
})

export const agentapi_runner_runner_update = data => Request({
  api: 'agentapi.runner.runner.update',
  server:'integral',
  signType: 'sha',
  data,
})

export const agentapi_account_runner_logout = data => Request({
  api: 'agentapi.account.runner.logout',
  server:'integral',
  signType: 'sha',
  data,
})
