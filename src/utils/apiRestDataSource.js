const { correlationManager } = require('@totalsoft/correlation')
const { NoCacheRESTDataSource } = require('./noCacheRESTDataSource')
const { UserId, UserPassport } = require('../constants/customHttpHeaders')
const { assoc } = require('ramda')

class ApiRESTDataSource extends NoCacheRESTDataSource {
  constructor(context) {
    super(context)
    this.context = context
  }

  willSendRequest(_path, request) {
    const { jwtdata } = this.context.state ?? {}
    request.headers = assoc(UserPassport, jwtdata ? JSON.stringify(jwtdata) : undefined, request.headers)
    request.headers = assoc(UserId, jwtdata?.sub, request.headers)

    //TODO to be removed
    if (this.context.token) {
      request.headers = assoc('Authorization', `Bearer ${this.context.token}`, request.headers)
    }

    const acceptLanguage = this.context.request?.headers?.['accept-language']
    if (acceptLanguage) request.headers['Accept-Language'] = acceptLanguage

    const correlationId = correlationManager.getCorrelationId()
    if (correlationId) request.headers['x-correlation-id'] = correlationId
  }
}

module.exports = ApiRESTDataSource
