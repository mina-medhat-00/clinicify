import { Button } from "@/components/ui/controls";
import { Table, type TableColumn } from "@/components/ui/table";
import { Tag } from "@/components/ui/display";
import { useState, type Key, type ReactNode } from "react";
import AppointmentDetails from "@/components/admin/appointment-details";
import { useNameColumn, type NamedRow } from "@/components/admin/user-columns";
import ClinicDetails from "@/components/profile/clinic-details";
import PopUp from "@/components/ui/pop-up";
import SlotsContextProvider from "@/contexts/slots-context";
import { useDoctorsContext } from "@/contexts/doctors-context";
import { useUserContext } from "@/contexts/user-context";
import changeState, { type AccountAction } from "@/services/change-state";
import type { Doctor, Id, Verification } from "@/types/user";

interface DoctorRow extends NamedRow {
  key: Id;
  specialty: ReactNode;
  verified: Verification;
  action: ReactNode;
}

export default function DoctorManagement() {
  const nameColumn = useNameColumn({
    cardClass: "bg-gray-200/80 hover:bg-gray-200",
    avatarUserType: "doctor",
  });
  const columns: (TableColumn<DoctorRow> | typeof Table.EXPAND_COLUMN)[] = [
    Table.EXPAND_COLUMN,
    nameColumn,
    {
      title: "Specialty",
      dataIndex: "specialty",
      key: "specialty",
    },
    {
      title: "State",
      key: "state",
      dataIndex: "verified",
      render: function (value) {
        return (
          <Tag color={value ? "blue" : value === 0 ? "red" : "gold"}>
            {value ? "VERIFIED" : value === 0 ? "REJECTED" : "PENDING"}
          </Tag>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
    },
  ];
  const { isLoading, doctorsData, fetchDoctorsData } = useDoctorsContext();
  const { fetchUserData, messageApi } = useUserContext();
  // The doctor whose slots are expanded in the table.
  const [openKey, setOpenKey] = useState<Key | null>(null);
  // The doctor whose clinic is shown (kept while the popup closes).
  const [doctorRecord, setDoctorRecord] = useState<Doctor | null>(null);
  const [showPopUp, setShowPopUp] = useState(false);
  function changeDoctor(action: AccountAction, doctorId: Id) {
    void changeState({
      action,
      target: "doctor",
      id: doctorId,
      messageApi,
      fetchUserData,
    }).then(function (changed) {
      if (changed) void fetchDoctorsData({ total: true }, { silent: true });
    });
  }
  const doctorsDetails = doctorsData?.map(function (doctor): DoctorRow {
    const {
      doctor_id,
      img_urls,
      nick_name,
      specialty,
      is_verified,
      clinic_street,
    } = doctor;
    return {
      key: doctor_id,
      specialty: <span>{specialty}</span>,
      verified: is_verified,
      action: (
        <div className="flex flex-col gap-2 items-center">
          {clinic_street && (
            <Button
              onClick={function () {
                setDoctorRecord(doctor);
                setShowPopUp(true);
              }}
              className="bg-green-400 hover:bg-green-600 rounded-lg font-medium text-white"
            >
              Clinic Details
            </Button>
          )}
          {!is_verified && (
            <Button
              onClick={function () {
                changeDoctor("verify", doctor_id);
              }}
              className="bg-blue-400 hover:bg-blue-600 rounded-lg font-medium text-white"
            >
              VERIFY
            </Button>
          )}
          {is_verified !== 0 && (
            <Button
              onClick={function () {
                changeDoctor("reject", doctor_id);
              }}
              className="bg-red-400 hover:bg-red-600 rounded-lg font-medium text-white"
            >
              REJECT
            </Button>
          )}
        </div>
      ),
      name: { nick_name, img_url: img_urls },
    };
  });

  return (
    <div className="px-4 admin--table">
      <PopUp
        show={showPopUp}
        mt="80px"
        customWidth="w-5/6 sm:w-4/5 lg:w-3/4"
        handleClose={function () {
          setShowPopUp(false);
        }}
      >
        <ClinicDetails admin={true} clinicValues={doctorRecord} />
      </PopUp>
      <div className="flex overflow-auto scroll--h h-screen">
        <div className="grow">
          <Table<DoctorRow>
            expandable={{
              expandedRowRender: function (record) {
                return (
                  <SlotsContextProvider>
                    <AppointmentDetails doctorId={record.key} />
                  </SlotsContextProvider>
                );
              },
              expandedRowKeys: [openKey],
              onExpand: function (expanded, record) {
                setOpenKey(expanded ? record.key : null);
              },
            }}
            pagination={
              (doctorsData?.length ?? 0) > 4 ? { pageSize: 4 } : false
            }
            columns={columns}
            loading={isLoading}
            dataSource={doctorsDetails}
          />
        </div>
      </div>
    </div>
  );
}
