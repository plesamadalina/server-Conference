const ConferenceApi = require('../features/conference/conferenceApi')

module.exports.getDataSources = context => ({
  // Instantiate your data sources here. e.g.: userApi: new UserApi(context)
  conferenceApi: new ConferenceApi(context)
})
