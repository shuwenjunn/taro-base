import Request from '../../utils/request'

export const autologin = data => Request({
  api: 'agentapi.account.runner.autologin',
  server:'integral',
  signType: 'sha',
  data,
})

export const agentapi_appointment_runner_search = data => Request({
  api: 'agentapi.appointment.runner.search',
  server:'integral',
  signType: 'sha',
  data,
})

export const agentapi_appointment_runner_statistics = data => Request({
  api: 'agentapi.appointment.runner.statistics',
  server:'integral',
  signType: 'sha',
  data,
})

