import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import DatePicker from "react-datepicker";
import { ADD_EVENT, UPDATE_EVENT } from "../lib/queries";
import "react-datepicker/dist/react-datepicker.css";

export default function EventForm({ event, onEventCreated, onCancel }) {
  const isEditing = !!event;
  const [startTime, setStartTime] = useState(
    event ? new Date(event.startTime) : new Date()
  );
  const [endTime, setEndTime] = useState(
    event ? new Date(event.endTime) : new Date(Date.now() + 60 * 60 * 1000)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      location: event?.location || "",
      isRecurring: event?.isRecurring || false,
      recurrenceRule: event?.recurrenceRule || "",
    },
  });

  const isRecurring = watch("isRecurring");

  const [createEvent, { loading: createLoading }] = useMutation(ADD_EVENT, {
    onCompleted: () => {
      reset();
      setStartTime(new Date());
      setEndTime(new Date(Date.now() + 60 * 60 * 1000));
      onEventCreated();
    },
    onError: (error) => {
      console.error("Create error:", error);
    },
  });

  const [updateEvent, { loading: updateLoading }] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      onEventCreated();
    },
    onError: (error) => {
      console.error("Update error:", error);
    },
  });

  const loading = createLoading || updateLoading;

  // Validate start time is not in the past
  const validateStartTime = (selectedTime) => {
    const now = new Date();

    // For new events, start time cannot be in the past
    if (!isEditing && selectedTime < now) {
      setError("startTime", {
        type: "manual",
        message: "Start time cannot be in the past",
      });
      return false;
    }

    // For editing existing events, allow past start times only if they were already in the past
    if (isEditing && event) {
      const originalStartTime = new Date(event.startTime);
      // If original event was in the future, don't allow moving it to the past
      if (originalStartTime > now && selectedTime < now) {
        setError("startTime", {
          type: "manual",
          message: "Cannot move future event to past time",
        });
        return false;
      }
    }

    clearErrors("startTime");
    return true;
  };

  // Handle start time change with validation
  const handleStartTimeChange = (date) => {
    if (!date) return;

    setStartTime(date);

    // Validate the selected start time
    if (validateStartTime(date)) {
      // Ensure end time is after start time
      if (date >= endTime) {
        setEndTime(new Date(date.getTime() + 60 * 60 * 1000));
      }
    }
  };

  // Handle end time change with validation
  const handleEndTimeChange = (date) => {
    if (!date) return;

    if (date <= startTime) {
      setError("endTime", {
        type: "manual",
        message: "End time must be after start time",
      });
    } else {
      // Validate event duration (max 24 hours)
      const maxDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      if (date - startTime > maxDuration) {
        setError("endTime", {
          type: "manual",
          message: "Event duration cannot exceed 24 hours",
        });
      } else {
        clearErrors("endTime");
        setEndTime(date);
      }
    }
  };

  // Validate times on component mount and when editing
  useEffect(() => {
    if (startTime) {
      validateStartTime(startTime);
    }
    if (endTime && startTime >= endTime) {
      setError("endTime", {
        type: "manual",
        message: "End time must be after start time",
      });
    } else {
      clearErrors("endTime");
    }
  }, [startTime, endTime, isEditing]);

  const onSubmit = async (data) => {
    // Final validation before submission
    const now = new Date();

    if (!isEditing && startTime < now) {
      setError("startTime", {
        type: "manual",
        message: "Start time cannot be in the past",
      });
      return;
    }

    if (startTime >= endTime) {
      setError("endTime", {
        type: "manual",
        message: "End time must be after start time",
      });
      return;
    }

    // Validate event duration
    const maxDuration = 24 * 60 * 60 * 1000;
    if (endTime - startTime > maxDuration) {
      setError("endTime", {
        type: "manual",
        message: "Event duration cannot exceed 24 hours",
      });
      return;
    }

    // Validate recurrence rule if recurring is selected
    if (data.isRecurring && !data.recurrenceRule) {
      setError("recurrenceRule", {
        type: "manual",
        message: "Recurrence rule is required when event is recurring",
      });
      return;
    }

    try {
      const eventInput = {
        title: data.title,
        description: data.description,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        location: data.location,
        isRecurring: data.isRecurring,
        recurrenceRule: data.isRecurring ? data.recurrenceRule : null,
      };

      if (isEditing) {
        await updateEvent({
          variables: {
            id: event.id,
            input: eventInput,
          },
        });
      } else {
        await createEvent({
          variables: {
            input: eventInput,
          },
        });
      }
    } catch (error) {
      console.error("Submit error:", error);

      // Handle GraphQL validation errors from backend
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        const backendError = error.graphQLErrors[0].message;

        // Map backend errors to appropriate form fields
        if (backendError.includes("Title")) {
          setError("title", { type: "manual", message: backendError });
        } else if (backendError.includes("Description")) {
          setError("description", { type: "manual", message: backendError });
        } else if (backendError.includes("Location")) {
          setError("location", { type: "manual", message: backendError });
        } else if (
          backendError.includes("start time") ||
          backendError.includes("Start time")
        ) {
          setError("startTime", { type: "manual", message: backendError });
        } else if (
          backendError.includes("end time") ||
          backendError.includes("End time")
        ) {
          setError("endTime", { type: "manual", message: backendError });
        } else if (
          backendError.includes("duration") ||
          backendError.includes("Duration")
        ) {
          setError("endTime", { type: "manual", message: backendError });
        } else if (
          backendError.includes("Recurrence") ||
          backendError.includes("recurrence")
        ) {
          setError("recurrenceRule", { type: "manual", message: backendError });
        } else {
          // Generic error handling
          setError("title", { type: "manual", message: backendError });
        }
      }
    }
  };

  // Check if form has validation errors
  const hasTimeErrors =
    errors.startTime || errors.endTime || errors.recurrenceRule;
  const isSubmitDisabled = loading || hasTimeErrors;

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {isEditing ? "Edit Event" : "Create New Event"}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              {...register("title", {
                required: "Title is required",
                minLength: { value: 1, message: "Title cannot be empty" },
                maxLength: {
                  value: 200,
                  message: "Title must be less than 200 characters",
                },
              })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
              placeholder="Enter event title"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              {...register("description", {
                required: "Description is required",
                minLength: { value: 1, message: "Description cannot be empty" },
                maxLength: {
                  value: 1000,
                  message: "Description must be less than 1000 characters",
                },
              })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
              placeholder="Enter event description"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date & Time *
              </label>
              <DatePicker
                selected={startTime}
                onChange={handleStartTimeChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.startTime ? "border-red-300" : ""
                }`}
                minDate={!isEditing ? new Date() : undefined}
                required
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.startTime.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date & Time *
              </label>
              <DatePicker
                selected={endTime}
                onChange={handleEndTimeChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                  errors.endTime ? "border-red-300" : ""
                }`}
                minDate={startTime}
                required
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.endTime.message}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location *
            </label>
            <input
              type="text"
              id="location"
              {...register("location", {
                required: "Location is required",
                minLength: { value: 1, message: "Location cannot be empty" },
                maxLength: {
                  value: 300,
                  message: "Location must be less than 300 characters",
                },
              })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
              placeholder="Enter event location"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Recurring Options */}
          <div>
            <div className="flex items-center">
              <input
                id="isRecurring"
                type="checkbox"
                {...register("isRecurring")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isRecurring"
                className="ml-2 block text-sm text-gray-900"
              >
                This is a recurring event
              </label>
            </div>

            {isRecurring && (
              <div className="mt-3">
                <label
                  htmlFor="recurrenceRule"
                  className="block text-sm font-medium text-gray-700"
                >
                  Recurrence Rule
                </label>
                <select
                  id="recurrenceRule"
                  {...register("recurrenceRule", {
                    validate: (value) => {
                      if (watch("isRecurring") && !value) {
                        return "Recurrence rule is required when event is recurring";
                      }
                      if (
                        value &&
                        !["daily", "weekly", "monthly", "yearly"].includes(
                          value.toLowerCase()
                        )
                      ) {
                        return "Recurrence rule must be one of: daily, weekly, monthly, yearly";
                      }
                      return true;
                    },
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border px-3 py-2"
                >
                  <option value="">Select recurrence</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {errors.recurrenceRule && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.recurrenceRule.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? "Updating..." : "Creating..."}
                </div>
              ) : isEditing ? (
                "Update Event"
              ) : (
                "Create Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
