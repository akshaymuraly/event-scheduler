import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@apollo/client";
import Link from "next/link";
import { format } from "date-fns";
import { GET_EVENT_BY_ID, DELETE_EVENT } from "../../lib/queries";
import EventForm from "../../components/EventForm";

export default function EventDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_EVENT_BY_ID, {
    variables: { id },
    skip: !id,
  });

  const [deleteEvent, { loading: deleteLoading }] = useMutation(DELETE_EVENT, {
    onCompleted: () => {
      router.push("/");
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  // ✅ Fixed: Use 'event' instead of 'getEventById' to match corrected query
  const event = data?.event;

  const handleDelete = async () => {
    try {
      await deleteEvent({ variables: { id } });
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleEventUpdated = () => {
    setIsEditing(false);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="px-4 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            {error
              ? `Error loading event: ${error.message}`
              : "Event not found"}
          </p>
        </div>
        <div className="mt-4">
          <Link href="/" className="text-blue-600 hover:text-blue-500">
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="px-4 sm:px-0">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-500">
            ← Back to Events
          </Link>
        </div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
        </div>
        <EventForm
          event={event}
          onEventCreated={handleEventUpdated}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:text-blue-500">
          ← Back to Events
        </Link>
      </div>

      {/* Event Details */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {event.title}
              {event.isRecurring && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Recurring{" "}
                  {event.recurrenceRule && `(${event.recurrenceRule})`}
                </span>
              )}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Event details and information
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {event.description || "No description provided"}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Start Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(
                  new Date(event.startTime),
                  "EEEE, MMMM d, yyyy 'at' h:mm a"
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">End Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(
                  new Date(event.endTime),
                  "EEEE, MMMM d, yyyy 'at' h:mm a"
                )}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {event.location}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Duration</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {(() => {
                  const start = new Date(event.startTime);
                  const end = new Date(event.endTime);
                  const diffMs = end - start;
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffMinutes = Math.floor(
                    (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                  );

                  if (diffHours > 0) {
                    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ${
                      diffMinutes > 0
                        ? `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`
                        : ""
                    }`.trim();
                  }
                  return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
                })()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Delete Event
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{event.title}"? This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 px-4 py-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
