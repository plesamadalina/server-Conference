const welcomeQueryResolvers = {
  Query: {
    helloWorld: (_parent, _args, _context, _info) => {
      return 'Hello World! ❤'
    }
  }
}
module.exports = welcomeQueryResolvers
