import { Ban, ClipboardPlus, FileHeart } from "lucide-react";
import type { MedicalValues } from "@/components/profile/medical-form";
import type { SetProfileDrawer } from "@/types/profile-drawer";
import ProfileTable from "@/components/profile/profile-table";

export default function PatientRecords({
  records,
  setHandleDrawer,
  isAuth,
}: {
  records: MedicalValues;
  setHandleDrawer: SetProfileDrawer;
  isAuth: boolean;
}) {
  function openMedicalForm() {
    setHandleDrawer(function (draw) {
      return {
        ...draw,
        isOpen: true,
        type: "medical",
        name: "My Medical History",
      };
    });
  }
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
                onClick={openMedicalForm}
                className="text-2xl hover:text-gray-500 cursor-pointer"
              />
            ) : (
              <Ban className="text-2xl" />
            )
          }
          data={Object.entries(records).map(function ([name, value]) {
            return {
              // "currentIssue" -> "current Issue"
              name: name.replace(/[A-Z]/, function (letter) {
                return ` ${letter}`;
              }),
              value: value as MedicalValues[keyof MedicalValues],
            };
          })}
        />
        {isAuth && (
          <div
            onClick={openMedicalForm}
            className="bg-gray-300/50 gap-2 hover:bg-gray-300/80 flex justify-center items-center h-24 text-center cursor-pointer text-gray-500 text-lg sm:text-xl xl:text-2xl font-medium rounded-lg hover:shadow-sm p-3 hover:text-gray-700 grow"
          >
            <FileHeart className="w-7 h-7" />
            {records.currentIssue ? "Edit" : "Add"} Medical History
          </div>
        )}
      </div>
    </>
  );
}
