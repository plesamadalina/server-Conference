const { prisma } = require('../../prisma')
const { map } = require('ramda')

const conferenceMutationResolvers = {
  Mutation: {
    saveConference: (_parent, { input }, _ctx, _info) => {
      const { id: conferenceId, location, typeId, categoryId, deletedSpeakers, speakers, ...restConference } = input
      const { id: locationId, ...restLocation } = location

      //we use the upsert method to update the location if it already exists or create it if it doesn't
      const result = prisma().$transaction(async prismaClient => {
        const upsertedLocation = prismaClient.location.upsert({
          where: { id: locationId || -1 },
          update: restLocation,
          create: restLocation
        })

        //we define a conference object that can be used for both create and update operations
        const conferenceInput = {
          ...restConference,
          dictionaryConferenceType: {
            connect: { id: typeId }
          },
          dictionaryCategory: {
            connect: { id: categoryId }
          },
          location: {
            connect: { id: upsertedLocation.id }
          }
        }
        //we use the upsert method to update the conference if it already exists or create it if it doesn't
        const upsertedConference = await prismaClient.conference.upsert({
          where: { id: conferenceId || -1 },
          update: conferenceInput,
          create: conferenceInput
        })

        //disconnect the deleted speakers from the conference (cei stersi)
        await prismaClient.conferenceXSpeaker.deleteMany({ where: { conferenceId, speakerId: { in: deletedSpeakers } } })

        await Promise.all(
          map(async ({ id: speakerId, isMainSpeaker, ...restSpeaker }) => {
            const upsertedSpeaker = await prismaClient.speaker.upsert({
              where: { id: speakerId || -1 },
              update: restSpeaker,
              create: restSpeaker
            })

            await prismaClient.conferenceXSpeaker.upsert({
              where: { conferenceId_speakerId: { conferenceId: upsertedConference.id, speakerId: upsertedSpeaker.id } },
              update: { isMainSpeaker },
              create: { conferenceId: upsertedConference.id, speakerId: upsertedSpeaker.id, isMainSpeaker }
            })
          }, speakers)
        )

        return upsertedConference
      })
      return result
    }
  }
}

module.exports = conferenceMutationResolvers
