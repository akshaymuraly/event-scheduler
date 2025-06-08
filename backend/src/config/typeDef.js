const { gql } = require("apollo-server-express");

const typeDefs = gql`
  scalar DateTime

  type Event {
    id: ID!
    title: String!
    description: String!
    startTime: DateTime!
    endTime: DateTime!
    location: String!
    isRecurring: Boolean!
    recurrenceRule: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input EventInput {
    title: String!
    description: String!
    startTime: DateTime!
    endTime: DateTime!
    location: String!
    isRecurring: Boolean!
    recurrenceRule: String
  }

  input EventUpdateInput {
    title: String
    description: String
    startTime: DateTime
    endTime: DateTime
    location: String
    isRecurring: Boolean
    recurrenceRule: String
  }

  input DateRangeInput {
    startDate: DateTime!
    endDate: DateTime!
  }

  type Query {
    # Fetch all upcoming events
    upcomingEvents: [Event!]!

    # Fetch a single event by ID
    event(id: ID!): Event

    # Filter events by date range
    eventsByDateRange(dateRange: DateRangeInput!): [Event!]!

    # Get all events (for admin purposes)
    allEvents: [Event!]!
  }

  type Mutation {
    # Add a new event
    addEvent(input: EventInput!): Event!

    # Update an event's details
    updateEvent(id: ID!, input: EventUpdateInput!): Event!

    # Delete an event
    deleteEvent(id: ID!): Boolean!
  }

  type Subscription {
    eventAdded: Event!
    eventUpdated: Event!
    eventDeleted: ID!
  }
`;

module.exports = typeDefs;
