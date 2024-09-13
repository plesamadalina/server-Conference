const { RESTDataSource } = require('@apollo/datasource-rest')

class ConferenceApi extends RESTDataSource {
  constructor() {
    super()
    this.baseURL = process.env.API_URL
  }

  async sendSMSNotification(body) {
    const response = await this.post('notification/SendSpeakerSmsNotification', { body })
    return response
  }
}

module.exports = ConferenceApi
