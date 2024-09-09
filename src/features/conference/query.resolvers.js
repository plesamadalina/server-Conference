const { prisma } = require('../../prisma')

const conferenceQueryResolvers = {
  Query: {
    conferenceList: (_parent, { filters }, _ctx, _info) => {
      let where = undefined

      if (filters) where = {}
      if (filters?.startDate) where.startDate = { gte: filters.startDate }
      if (filters?.endDate) where.endDate = { lte: filters.endDate }

      return prisma().conference.findMany({ where })
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
