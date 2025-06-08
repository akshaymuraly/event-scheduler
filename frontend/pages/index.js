import { useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { format } from "date-fns";
import { GET_UPCOMING_EVENTS, GET_EVENTS_BY_DATE_RANGE } from "../lib/queries";
import EventForm from "../components/EventForm";
import DateRangeFilter from "../components/DateRangeFilter";

export default function Home() {
  const [showForm, setShowForm] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  // Use different query based on date range filter
  const { loading, error, data, refetch } = useQuery(
    dateRange ? GET_EVENTS_BY_DATE_RANGE : GET_UPCOMING_EVENTS,
    {
      variables: dateRange
        ? {
            dateRange: {
              // ✅ Wrap in dateRange object
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
            },
          }
        : undefined,
      fetchPolicy: "cache-and-network",
    }
  );

  // ✅ Fix the data access to match corrected query names
  const events = data?.upcomingEvents || data?.eventsByDateRange || [];

  const handleEventCreated = () => {
    setShowForm(false);
    refetch();
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const clearFilter = () => {
    setDateRange(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error loading events: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your upcoming events and schedule
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showForm ? "Cancel" : "Add Event"}
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="mb-6">
        <DateRangeFilter
          onDateRangeChange={handleDateRangeChange}
          onClear={clearFilter}
          hasFilter={!!dateRange}
        />
      </div>

      {/* Event Form */}
      {showForm && (
        <div className="mb-6">
          <EventForm onEventCreated={handleEventCreated} />
        </div>
      )}

      {/* Events List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14l-7 7m0 0-7-7m7 7V10.5M19 21v-8a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No events found
            </h3>
            <p className="text-gray-500">
              {dateRange
                ? "No events in the selected date range."
                : "Get started by creating your first event."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/events/${event.id}`}
                  className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-lg font-medium text-blue-600 truncate">
                          {event.title}
                        </p>
                        {event.isRecurring && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Recurring
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14l-7 7m0 0l7-7m-7 7V10.5M19 21v-8a2 2 0 00-2-2H9a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2z"
                          />
                        </svg>
                        <span>
                          {format(
                            new Date(event.startTime),
                            "MMM d, yyyy h:mm a"
                          )}{" "}
                          - {format(new Date(event.endTime), "h:mm a")}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
