const { prisma } = require('../../prisma')
const { map } = require('ramda')

const conferenceQueryResolvers = {
  Query: {
    conferenceList: (_parent, { filters }, _ctx, _info) => {
      let where = undefined

      if (filters) where = {}
      if (filters?.startDate) where.startDate = { gte: filters.startDate }
      if (filters?.endDate) where.endDate = { lte: filters.endDate }

      return prisma().conference.findMany({ where })
    },
    conference: (_parent, { id }, _ctx, _info) => {
      return prisma().conference.findUnique({ where: { id } })
    }
  },

  Conference: {
    type: ({ conferenceTypeId }) => {
      return prisma().dictionaryConferenceType.findUnique({ where: { id: conferenceTypeId } })
    },
    category: ({ categoryId }) => {
      return prisma().dictionaryCategory.findUnique({ where: { id: categoryId } })
    },
    location: ({ locationId }) => {
      return prisma().location.findUnique({ where: { id: locationId } })
    },
    status: async ({ id }, { userEmail }) => {
      const result = await prisma().conferenceXAttendee.findUnique({
        where: { conferenceId: id, attendeeEmail: userEmail },
        include: { dictionaryStatus: true }
      })

      return result?.dictionaryStatus
    },
    speakers: async ({ id }) => {
      const result = await prisma()
        .Conference.findUnique({ where: { id } })
        .conferenceXSpeaker({ include: { speaker: true } })
      return map(({ isMainSpeaker, speaker }) => ({ isMainSpeaker, ...speaker }), result)
    }
  },

  Location: {
    city: cityId => {
      return prisma().dictionaryCity.findUnique({ where: { id: cityId } })
    },
    county: countyId => {
      return prisma().dictionaryCounty.findUnique({ where: { id: countyId } })
    },
    country: countryId => {
      return prisma().dictionaryCountry.findUnique({ where: { id: countryId } })
    }
  }
}

module.exports = conferenceQueryResolvers
