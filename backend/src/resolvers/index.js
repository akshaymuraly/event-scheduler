const { DateTimeResolver } = require("graphql-scalars");
const eventResolvers = require("./eventResolvers");

const resolvers = {
  DateTime: DateTimeResolver,

  Query: {
    ...eventResolvers.Query,
  },

  Mutation: {
    ...eventResolvers.Mutation,
  },
};

module.exports = resolvers;
