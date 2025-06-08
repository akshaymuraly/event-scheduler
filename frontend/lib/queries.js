import { gql } from "@apollo/client";

export const GET_UPCOMING_EVENTS = gql`
  query GetUpcomingEvents {
    upcomingEvents {
      id
      title
      description
      startTime
      endTime
      location
      isRecurring
      recurrenceRule
      createdAt
      updatedAt
    }
  }
`;

export const GET_EVENT_BY_ID = gql`
  query GetEvent($id: ID!) {
    event(id: $id) {
      id
      title
      description
      startTime
      endTime
      location
      isRecurring
      recurrenceRule
      createdAt
      updatedAt
    }
  }
`;

export const GET_EVENTS_BY_DATE_RANGE = gql`
  query EventsByDateRange($dateRange: DateRangeInput!) {
    eventsByDateRange(dateRange: $dateRange) {
      id
      title
      description
      startTime
      endTime
      location
      isRecurring
      recurrenceRule
      createdAt
      updatedAt
    }
  }
`;

export const GET_ALL_EVENTS = gql`
  query GetAllEvents {
    allEvents {
      id
      title
      description
      startTime
      endTime
      location
      isRecurring
      recurrenceRule
      createdAt
      updatedAt
    }
  }
`;

export const ADD_EVENT = gql`
  mutation AddEvent($input: EventInput!) {
    addEvent(input: $input) {
      id
      title
      description
      startTime
      endTime
      location
      isRecurring
      recurrenceRule
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_EVENT = gql`
  mutation UpdateEvent($id: ID!, $input: EventUpdateInput!) {
    updateEvent(id: $id, input: $input) {
      id
      title
      description
      startTime
      endTime
      location
      isRecurring
      recurrenceRule
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`;
