import { Ban, Hospital, MapPin, Pencil, Phone } from "lucide-react";
import type { ReactNode } from "react";
import ProfileTable from "@/components/profile/profile-table";
import type { Clinic } from "@/types/clinic";
import type { SetProfileDrawer } from "@/types/profile-drawer";

interface ClinicSection {
  headerColor: string;
  propColor?: string;
  headers: ReactNode[];
  data: { label: string; name: keyof Clinic; preValue?: keyof Clinic }[];
  icon?: ReactNode;
}

const clinicDetails: ClinicSection[] = [
  {
    headerColor: "bg-gray-800/80",
    headers: [
      <div key="location" className="flex gap-2 items-center">
        <MapPin />
        Location Details
      </div>,
    ],
    data: [
      {
        label: "City",
        name: "clinic_city",
      },
      {
        label: "Street",
        name: "clinic_street",
      },
    ],
  },
  {
    headerColor: "bg-gray-700/80",
    headers: [
      <div key="contact" className="flex gap-2 items-center">
        <Phone />
        Contact
      </div>,
    ],
    data: [
      {
        label: "Clinic phone number",
        name: "clinic_pnumber",
        preValue: "clinic_prefix",
      },
      {
        label: "Clinic telephone",
        name: "clinic_tnumber",
        preValue: "clinic_prefix",
      },
    ],
    icon: <Ban />,
  },
];

function ClinicTable({
  headers,
  data,
  clinicValues,
  headerColor,
  propColor,
  icon,
}: ClinicSection & { clinicValues: Clinic | null }) {
  return (
    <div className="flex justify-between gap-2 flex-wrap items-center">
      <ProfileTable
        icon={icon}
        headerColor={headerColor}
        propColor={propColor}
        data={data.map(function ({ label, name, preValue }) {
          return {
            name: label,
            value: clinicValues?.[name],
            preValue: preValue && clinicValues?.[preValue],
          };
        })}
        headers={headers}
      />
    </div>
  );
}

export default function ClinicDetails({
  admin,
  setHandleDrawer,
  clinicValues,
}: {
  admin?: boolean;
  setHandleDrawer?: SetProfileDrawer;
  clinicValues: Clinic | null;
}) {
  return (
    <div className="clinic--wrapper--details my-5 rounded-xl">
      <div className="flex justify-center items-center gap-2 mt-4 mb-4 text-white font-medium text-lg sm:text-xl p-4 bg-gray-800">
        <Hospital /> Clinic Information
      </div>
      {clinicDetails.map(function (section, i) {
        return <ClinicTable key={i} {...section} clinicValues={clinicValues} />;
      })}
      {!admin && setHandleDrawer && (
        <div
          onClick={function () {
            setHandleDrawer(function (draw) {
              return {
                ...draw,
                isOpen: true,
                type: "clinic",
                name: "Clinic Information",
              };
            });
          }}
          className="bg-gray-300/50 gap-2 hover:bg-gray-300/80 flex justify-center items-center h-24 text-center cursor-pointer text-gray-500 text-lg sm:text-xl xl:text-2xl font-medium rounded-lg hover:shadow-sm p-3 hover:text-gray-700 grow"
        >
          <Pencil className="w-7 h-7" />
          Edit Clinic Information
        </div>
      )}
    </div>
  );
}
