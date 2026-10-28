import { Star } from "lucide-react";
import Loader from "@/components/ui/loader";
import type { DoctorStatistics } from "@/types/content";

// The doctor's own numbers, from /dashboard.
export default function DoctorStatisticsView({
  statistics,
  isLoading,
}: {
  statistics?: DoctorStatistics;
  isLoading?: boolean;
}) {
  if (isLoading) return <Loader />;
  if (!statistics)
    return (
      <p className="p-6 text-center text-gray-500">
        Statistics are not available right now.
      </p>
    );
  const tiles = [
    { label: "Total appointments", value: statistics.totalAppointments },
    { label: "Free slots", value: statistics.free },
    { label: "Booked", value: statistics.booked },
    { label: "Completed", value: statistics.done },
    { label: "Canceled", value: statistics.canceled },
    { label: "Reviews", value: statistics.totalReviews },
  ];
  return (
    <div className="p-4">
      <h1 className="mb-4 text-center text-xl text-gray-700 sm:text-2xl">
        Your Statistics
      </h1>
      <div className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-white p-4 shadow-sm">
        <Star className="size-6 fill-yellow-400 text-yellow-400" />
        <span className="text-3xl font-medium text-gray-800">
          {statistics.totalReviews ? statistics.avgRate.toFixed(1) : "-"}
        </span>
        <span className="text-gray-500">/ 5 average rating</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map(function ({ label, value }) {
          return (
            <div key={label} className="rounded-lg bg-white p-4 shadow-sm">
              <div className="text-sm text-gray-500">{label}</div>
              <div className="text-2xl font-medium text-gray-800">{value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
