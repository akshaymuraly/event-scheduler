// Format MongoDB event document for GraphQL response
function formatEvent(event) {
  if (!event) return null;

  return {
    id: event._id.toString(),
    title: event.title,
    description: event.description,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
    isRecurring: event.isRecurring,
    recurrenceRule: event.recurrenceRule || null,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

// Format date for display
function formatDate(date) {
  if (!date) return null;
  return new Date(date).toISOString();
}

// Format event for logging
function formatEventForLog(event) {
  return {
    id: event._id?.toString() || event.id,
    title: event.title,
    startTime: event.startTime,
    endTime: event.endTime,
    location: event.location,
  };
}

// Calculate event duration in minutes
function calculateDuration(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end - start) / (1000 * 60)); // Duration in minutes
}

// Check if event is currently active
function isEventActive(event) {
  const now = new Date();
  const start = new Date(event.startTime);
  const end = new Date(event.endTime);

  return now >= start && now <= end;
}

// Check if event is upcoming
function isEventUpcoming(event) {
  const now = new Date();
  const start = new Date(event.startTime);

  return start > now;
}

// Check if event is past
function isEventPast(event) {
  const now = new Date();
  const end = new Date(event.endTime);

  return end < now;
}

// Get event status
function getEventStatus(event) {
  if (isEventActive(event)) return "active";
  if (isEventUpcoming(event)) return "upcoming";
  if (isEventPast(event)) return "past";
  return "unknown";
}

// Format recurrence rule for display
function formatRecurrenceRule(rule) {
  if (!rule) return null;

  const formatted = rule.toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

module.exports = {
  formatEvent,
  formatDate,
  formatEventForLog,
  calculateDuration,
  isEventActive,
  isEventUpcoming,
  isEventPast,
  getEventStatus,
  formatRecurrenceRule,
};
