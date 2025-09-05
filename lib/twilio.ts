import twilio from 'twilio'

const sid = process.env.TWILIO_ACCOUNT_SID!
const token = process.env.TWILIO_AUTH_TOKEN!
export const twilioClient = twilio(sid, token)
export const twilioFrom = process.env.TWILIO_PHONE_NUMBER!