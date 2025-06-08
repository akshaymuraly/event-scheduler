const validator = require("validator");

// Validate event input for creation
function validateEventInput(input) {
  const {
    title,
    description,
    startTime,
    endTime,
    location,
    isRecurring,
    recurrenceRule,
  } = input;

  // Required field validation
  if (!title || !title.trim()) {
    return "Title is required and cannot be empty";
  }

  if (!description || !description.trim()) {
    return "Description is required and cannot be empty";
  }

  if (!location || !location.trim()) {
    return "Location is required and cannot be empty";
  }

  // Title validation
  if (title.length > 200) {
    return "Title must be less than 200 characters";
  }

  // Description validation
  if (description.length > 1000) {
    return "Description must be less than 1000 characters";
  }

  // Location validation
  if (location.length > 300) {
    return "Location must be less than 300 characters";
  }

  // Date validation
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (isNaN(start.getTime())) {
    return "Invalid start time format";
  }

  if (isNaN(end.getTime())) {
    return "Invalid end time format";
  }

  if (start >= end) {
    return "Start time must be before end time";
  }

  if (start < now) {
    return "Start time cannot be in the past";
  }

  // Maximum event duration validation (24 hours)
  const maxDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  if (end - start > maxDuration) {
    return "Event duration cannot exceed 24 hours";
  }

  // Recurring validation
  if (typeof isRecurring !== "boolean") {
    return "isRecurring must be a boolean value";
  }

  if (isRecurring && recurrenceRule) {
    const validRules = ["daily", "weekly", "monthly", "yearly"];
    if (!validRules.includes(recurrenceRule.toLowerCase())) {
      return "Recurrence rule must be one of: daily, weekly, monthly, yearly";
    }
  }

  if (isRecurring && !recurrenceRule) {
    return "Recurrence rule is required when event is recurring";
  }

  return null; // No errors
}

// Validate event input for updates
function validateEventUpdate(input) {
  const {
    title,
    description,
    startTime,
    endTime,
    location,
    isRecurring,
    recurrenceRule,
  } = input;

  // Optional field validation (only validate if provided)
  if (title !== undefined) {
    if (!title || !title.trim()) {
      return "Title cannot be empty";
    }
    if (title.length > 200) {
      return "Title must be less than 200 characters";
    }
  }

  if (description !== undefined) {
    if (!description || !description.trim()) {
      return "Description cannot be empty";
    }
    if (description.length > 1000) {
      return "Description must be less than 1000 characters";
    }
  }

  if (location !== undefined) {
    if (!location || !location.trim()) {
      return "Location cannot be empty";
    }
    if (location.length > 300) {
      return "Location must be less than 300 characters";
    }
  }

  // Date validation
  if (startTime !== undefined) {
    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return "Invalid start time format";
    }
  }

  if (endTime !== undefined) {
    const end = new Date(endTime);
    if (isNaN(end.getTime())) {
      return "Invalid end time format";
    }
  }

  // If both start and end times are provided, validate them together
  if (startTime !== undefined && endTime !== undefined) {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return "Start time must be before end time";
    }

    // Maximum event duration validation (24 hours)
    const maxDuration = 24 * 60 * 60 * 1000;
    if (end - start > maxDuration) {
      return "Event duration cannot exceed 24 hours";
    }
  }

  // Recurring validation
  if (isRecurring !== undefined) {
    if (typeof isRecurring !== "boolean") {
      return "isRecurring must be a boolean value";
    }
  }

  if (recurrenceRule !== undefined) {
    if (recurrenceRule) {
      const validRules = ["daily", "weekly", "monthly", "yearly"];
      if (!validRules.includes(recurrenceRule.toLowerCase())) {
        return "Recurrence rule must be one of: daily, weekly, monthly, yearly";
      }
    }
  }

  return null; // No errors
}

// Sanitize string input
function sanitizeString(str) {
  if (!str) return "";
  return validator.escape(str.trim());
}

// Validate date range
function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    return "Invalid start date format";
  }

  if (isNaN(end.getTime())) {
    return "Invalid end date format";
  }

  if (start > end) {
    return "Start date must be before or equal to end date";
  }

  // Limit date range to prevent performance issues (max 1 year)
  const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
  if (end - start > maxRange) {
    return "Date range cannot exceed 1 year";
  }

  return null; // No errors
}

module.exports = {
  validateEventInput,
  validateEventUpdate,
  sanitizeString,
  validateDateRange,
};
