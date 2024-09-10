const { prisma } = require('../../prisma')

const dictionaryQueryResolvers = {
  Query: {
    typeList: () => prisma().dictionaryConferenceType.findMany(),
    categoryList: () => prisma().dictionaryCategory.findMany(),
    countryList: () => prisma().dictionaryCountry.findMany(),
    countyList: () => prisma().dictionaryCounty.findMany(),
    cityList: () => prisma().dictionaryCity.findMany()
  }
}
module.exports = dictionaryQueryResolvers
