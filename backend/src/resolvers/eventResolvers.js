const { ObjectId } = require("mongodb");
const {
  validateEventInput,
  validateEventUpdate,
} = require("../utils/validations");
const { formatEvent } = require("../utils/formatters");

const eventResolvers = {
  Query: {
    // Fetch all upcoming events (events that haven't ended yet)
    upcomingEvents: async (parent, args, { db }) => {
      try {
        const now = new Date();
        const events = await db
          .collection("events")
          .find({
            endTime: { $gte: now },
          })
          .sort({ startTime: 1 })
          .toArray();

        return events.map(formatEvent);
      } catch (error) {
        throw new Error(`Failed to fetch upcoming events: ${error.message}`);
      }
    },

    // Fetch a single event by ID
    event: async (parent, { id }, { db }) => {
      try {
        if (!ObjectId.isValid(id)) {
          throw new Error("Invalid event ID format");
        }

        const event = await db
          .collection("events")
          .findOne({ _id: new ObjectId(id) });

        if (!event) {
          throw new Error("Event not found");
        }

        return formatEvent(event);
      } catch (error) {
        throw new Error(`Failed to fetch event: ${error.message}`);
      }
    },

    // Filter events by date range
    eventsByDateRange: async (parent, { dateRange }, { db }) => {
      try {
        const { startDate, endDate } = dateRange;

        if (new Date(startDate) > new Date(endDate)) {
          throw new Error("Start date must be before end date");
        }

        const events = await db
          .collection("events")
          .find({
            $or: [
              // Events that start within the range
              {
                startTime: {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
                },
              },
              // Events that end within the range
              {
                endTime: {
                  $gte: new Date(startDate),
                  $lte: new Date(endDate),
                },
              },
              // Events that span the entire range
              {
                startTime: { $lte: new Date(startDate) },
                endTime: { $gte: new Date(endDate) },
              },
            ],
          })
          .sort({ startTime: 1 })
          .toArray();

        return events.map(formatEvent);
      } catch (error) {
        throw new Error(
          `Failed to fetch events by date range: ${error.message}`
        );
      }
    },

    // Get all events (for admin purposes)
    allEvents: async (parent, args, { db }) => {
      try {
        const events = await db
          .collection("events")
          .find({})
          .sort({ startTime: 1 })
          .toArray();

        return events.map(formatEvent);
      } catch (error) {
        throw new Error(`Failed to fetch all events: ${error.message}`);
      }
    },
  },

  Mutation: {
    // Add a new event
    addEvent: async (parent, { input }, { db }) => {
      try {
        // Validate input
        const validationError = validateEventInput(input);
        if (validationError) {
          throw new Error(validationError);
        }

        // Check for time conflicts with existing events
        const conflictingEvent = await db.collection("events").findOne({
          $or: [
            // New event starts during existing event
            {
              startTime: { $lte: new Date(input.startTime) },
              endTime: { $gt: new Date(input.startTime) },
            },
            // New event ends during existing event
            {
              startTime: { $lt: new Date(input.endTime) },
              endTime: { $gte: new Date(input.endTime) },
            },
            // New event completely encompasses existing event
            {
              startTime: { $gte: new Date(input.startTime) },
              endTime: { $lte: new Date(input.endTime) },
            },
          ],
        });

        if (conflictingEvent) {
          throw new Error("Event time conflicts with existing event");
        }

        const now = new Date();
        const eventData = {
          ...input,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
          createdAt: now,
          updatedAt: now,
        };

        const result = await db.collection("events").insertOne(eventData);

        const newEvent = await db
          .collection("events")
          .findOne({ _id: result.insertedId });

        return formatEvent(newEvent);
      } catch (error) {
        throw new Error(`Failed to add event: ${error.message}`);
      }
    },

    // Update an event's details
    updateEvent: async (parent, { id, input }, { db }) => {
      try {
        if (!ObjectId.isValid(id)) {
          throw new Error("Invalid event ID format");
        }

        // Validate input
        const validationError = validateEventUpdate(input);
        if (validationError) {
          throw new Error(validationError);
        }

        // Check if event exists
        const existingEvent = await db
          .collection("events")
          .findOne({ _id: new ObjectId(id) });

        if (!existingEvent) {
          throw new Error("Event not found");
        }

        // Prepare update data
        const updateData = { ...input };
        if (input.startTime) {
          updateData.startTime = new Date(input.startTime);
        }
        if (input.endTime) {
          updateData.endTime = new Date(input.endTime);
        }
        updateData.updatedAt = new Date();

        // If updating times, check for conflicts
        if (input.startTime || input.endTime) {
          const startTime = input.startTime
            ? new Date(input.startTime)
            : existingEvent.startTime;
          const endTime = input.endTime
            ? new Date(input.endTime)
            : existingEvent.endTime;

          if (startTime >= endTime) {
            throw new Error("Start time must be before end time");
          }

          const conflictingEvent = await db.collection("events").findOne({
            _id: { $ne: new ObjectId(id) }, // Exclude current event
            $or: [
              {
                startTime: { $lte: startTime },
                endTime: { $gt: startTime },
              },
              {
                startTime: { $lt: endTime },
                endTime: { $gte: endTime },
              },
              {
                startTime: { $gte: startTime },
                endTime: { $lte: endTime },
              },
            ],
          });

          if (conflictingEvent) {
            throw new Error("Updated event time conflicts with existing event");
          }
        }

        await db
          .collection("events")
          .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

        const updatedEvent = await db
          .collection("events")
          .findOne({ _id: new ObjectId(id) });

        return formatEvent(updatedEvent);
      } catch (error) {
        throw new Error(`Failed to update event: ${error.message}`);
      }
    },

    // Delete an event
    deleteEvent: async (parent, { id }, { db }) => {
      try {
        if (!ObjectId.isValid(id)) {
          throw new Error("Invalid event ID format");
        }

        const result = await db
          .collection("events")
          .deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          throw new Error("Event not found");
        }

        return true;
      } catch (error) {
        throw new Error(`Failed to delete event: ${error.message}`);
      }
    },
  },
};

module.exports = eventResolvers;
