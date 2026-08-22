import { Ban, ClipboardPlus, FileHeart } from "lucide-react";
import ProfileTable from "@/components/profile/profile-table";

function PatientRecords({
  records,
  setHandleDrawer,
  profileData,
  isAuth,
}: any) {
  return (
    <>
      <div className="flex justify-center gap-2 items-center mt-4 mb-4 text-lg sm:text-xl text-white font-medium p-4 bg-gray-600">
        <ClipboardPlus className="text-xl" />
        Medical History
      </div>
      <div className="px-2">
        <ProfileTable
          headers={["Medical Problems", "Description"]}
          icon={
            isAuth ? (
              <FileHeart
                onClick={function () {
                  setHandleDrawer(function (draw?: any, ..._args: any[]) {
                    return {
                      ...draw,
                      isOpen: true,
                      type: "medical",
                      name: "My Medical History",
                    };
                  });
                }}
                className="text-2xl hover:text-gray-500 cursor-pointer"
              />
            ) : (
              <Ban className="text-2xl" />
            )
          }
          data={Object.entries(records).map(function ([name, value]: any) {
            return {
              name: name?.replace(
                /[A-Z]/,
                function (val?: any, ..._args: any[]) {
                  return ` ${val}`;
                },
              ),
              value,
            };
          })}
        />
        {isAuth && (
          <div
            onClick={function () {
              setHandleDrawer(function (draw?: any, ..._args: any[]) {
                return {
                  ...draw,
                  isOpen: true,
                  type: "medical",
                  name: "My Medical History",
                };
              });
            }}
            className="bg-gray-300/50 gap-2 hover:bg-gray-300/80 flex justify-center items-center h-24 text-center cursor-pointer text-gray-500
           text-lg sm:text-xl xl:text-2xl font-medium rounded-lg hover:shadow-sm p-3 hover:text-gray-700 grow"
          >
            <FileHeart className="w-7 h-7" />
            {profileData?.["patientRecords"]?.currentIssue
              ? "Add"
              : "Edit"}{" "}
            Medical History
          </div>
        )}
      </div>
    </>
  );
}

export default PatientRecords;
