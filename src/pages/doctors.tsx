import { forwardRef } from "react";
import { Carousel } from "@/components/ui/carousel";
import { Empty } from "@/components/ui/display";
import DoctorCard from "@/components/doctor/doctor-card";
import SearchFilter, {
  type SearchFilterHandle,
} from "@/components/doctor/search-filter";
import Loader from "@/components/ui/loader";
import ServerError from "@/components/ui/server-error";
import TableGrid from "@/components/ui/table-grid";
import { useDoctorsContext } from "@/contexts/doctors-context";
import { useUserContext } from "@/contexts/user-context";
import { useUtilsContext } from "@/contexts/utils-context";

export type DoctorsHandle = SearchFilterHandle;

export default forwardRef<DoctorsHandle, { home?: boolean }>(function Doctors(
  { home },
  ref,
) {
  const { socket, timeZone, isMobile } = useUtilsContext();
  const { userData: user } = useUserContext();
  const { doctorsData, isLoading, fetchDoctorsData, isError } =
    useDoctorsContext();
  const doctors = doctorsData ?? [];
  return (
    <>
      {/* The home section keeps its own fixed query (top 5), so no filter there. */}
      {!home && <SearchFilter ref={ref} fetchDoctorsData={fetchDoctorsData} />}
      {home && isMobile ? (
        <div className="px-2 my-2">
          <Carousel
            autoplay
            autoplaySpeed={30000}
            dotPlacement="bottom"
            className="bg-gray-200/40 rounded-md"
            dots={{
              className: "bg-gray-700 p-1 rounded-md",
            }}
          >
            {doctors.length > 0 ? (
              doctors.map(function (doctor) {
                return (
                  <div className="mb-16" key={doctor.doctor_id}>
                    <DoctorCard
                      doctor={doctor}
                      user={user}
                      socket={socket}
                      timeZone={timeZone}
                    />
                  </div>
                );
              })
            ) : isLoading ? (
              <Loader />
            ) : isError ? (
              <ServerError errorTitle="Doctors" />
            ) : (
              <Empty
                className="my-4 text-gray-500 font-medium"
                description="There are no doctors"
              />
            )}
          </Carousel>
        </div>
      ) : (
        <div className="flex flex-wrap justify-evenly gap-2">
          {doctors.length > 0 ? (
            <TableGrid
              heightFull
              items={doctors.map(function (doctor, i) {
                return {
                  key: doctor.doctor_id,
                  element: (
                    <DoctorCard
                      doctor={doctor}
                      user={user}
                      socket={socket}
                      // An odd last card takes the full row.
                      isLast={
                        doctors.length % 2 === 1 && doctors.length === i + 1
                      }
                      timeZone={timeZone}
                    />
                  ),
                };
              })}
            />
          ) : isLoading ? (
            <Loader />
          ) : isError ? (
            <ServerError errorTitle="Doctors" />
          ) : (
            <Empty
              className={`${home ? "" : "mt-20"} mb-4 font-medium`}
              description={
                <span
                  className={
                    home
                      ? "text-white bg-blue-600/60 p-1 rounded"
                      : "text-gray-500"
                  }
                >
                  There are no doctors
                </span>
              }
            />
          )}
        </div>
      )}
    </>
  );
});
