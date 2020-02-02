import Request from '../../utils/request'


export const agentapi_appointment_runner_get = data => Request({
  api: 'agentapi.appointment.runner.get',
  server:'integral',
  signType: 'sha',
  data,
})

//结束
export const agentapi_appointment_runner_end = data => Request({
  api: 'agentapi.appointment.runner.end',
  server:'integral',
  signType: 'sha',
  data,
})