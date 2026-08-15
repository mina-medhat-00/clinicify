import { SearchOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, Space, Table, Tag } from "antd";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import doctorPhoto from "@/assets/images/doctor-photo.png";
import AppointmentDetails from "@/components/admin/appointment-details";
import ClinicDetails from "@/components/profile/clinic-details";
import PopUp from "@/components/ui/pop-up";
import { SlotsContextProvider } from "@/contexts";
import { useDoctorsContext } from "@/contexts/doctors-context";
import { useUserContext } from "@/contexts/user-context";
import changeState from "@/services/change-state";

const DoctorManagement = (_props?: any) => {
  const searchInput = useRef(null);
  const handleSearch = (confirm?: any, ..._args: any[]) => {
    confirm();
  };
  const handleReset = (clearFilters?: any, ..._args: any[]) => {
    clearFilters();
  };
  const getColumnSearchProps = (dataIndex?: any, ..._args: any[]) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }: any) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e?: any, ..._args: any[]) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e?: any, ..._args: any[]) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            className="flex items-center justify-center"
            onClick={() => handleSearch(confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered?: any, ..._args: any[]) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1890ff" : undefined,
        }}
      />
    ),
    onFilter: (value?: any, record?: any, ..._args: any[]) =>
      record[dataIndex].nick_name
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange: (visible?: any, ..._args: any[]) => {
        if (visible) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });
  const columns = [
    Table.EXPAND_COLUMN,
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
      render: (rec?: any, record?: any, ..._args: any[]) => (
        <Link
          to={`/profile/${record?.key}`}
          className="flex flex-col bg-gray-200/80 hover:bg-gray-200 px-4 py-2 text-center rounded-md shadow-md justify-center items-center gap-2"
        >
          <Avatar src={rec?.img_url || doctorPhoto} size="large" />
          <span className="font-medium text-gray-600">{rec?.nick_name}</span>
        </Link>
      ),
    },
    {
      title: "Specialty",
      dataIndex: "specialty",
      key: "specialty",
    },
    {
      title: "State",
      key: "state",
      dataIndex: "verified",
      render: (value?: any, ..._args: any[]) => (
        <Tag color={value ? "blue" : value == 0 ? "red" : "gold"}>
          {value ? "VERIFIED" : value == 0 ? "REJECTED" : "PENDING"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
    },
  ];
  const { isLoading, doctorsData, fetchDoctorsData } = useDoctorsContext();
  const { fetchUserData, messageApi } = useUserContext();
  const [openKey, setOpenKey] = useState<any>(null);
  const [doctorRecord, setDoctorRecord] = useState<any>(null);
  const [showPopUp, setShowPopUp] = useState<any>(null);
  const [, setIsLoading] = useState(false);
  const doctorsDetails = doctorsData?.map(
    (
      {
        doctor_id,
        img_url,
        nick_name,
        specialty,
        is_verified,
        clinic_street,
      }: any,
      i?: any,
    ) => ({
      key: doctor_id,
      specialty: <span className="">{specialty}</span>,
      verified: is_verified,
      action: (
        <div className="flex flex-col gap-2 items-center">
          {clinic_street && (
            <Button
              onClick={() => {
                setDoctorRecord(doctorsData?.[i]);
                setShowPopUp(true);
              }}
              className="bg-green-400 hover:bg-green-600 rounded-lg font-medium text-white"
            >
              Clinic Details
            </Button>
          )}
          {!is_verified && (
            <Button
              onClick={() =>
                changeState(
                  fetchUserData,
                  fetchDoctorsData,
                  messageApi,
                  setIsLoading,
                  "verify",
                  doctor_id,
                )
              }
              className="bg-blue-400 hover:bg-blue-600 rounded-lg font-medium text-white"
            >
              VERIFY
            </Button>
          )}
          {is_verified !== 0 && (
            <Button
              onClick={() =>
                changeState(
                  fetchUserData,
                  fetchDoctorsData,
                  messageApi,
                  setIsLoading,
                  "reject",
                  doctor_id,
                )
              }
              className="bg-red-400 hover:bg-red-600 rounded-lg font-medium text-white"
            >
              REJECT
            </Button>
          )}
        </div>
      ),
      name: {
        nick_name,
        img_url,
      },
    }),
  );

  return (
    <div className="px-4 admin--table">
      <PopUp
        show={showPopUp}
        mt="80px"
        customWidth={"w-5/6 sm:w-4/5 lg:w-3/4"}
        handleClose={() => {
          setShowPopUp(null);
          setTimeout(() => setDoctorRecord(null), 400);
        }}
      >
        <ClinicDetails admin={true} clinicValues={doctorRecord} />
      </PopUp>
      <div
        className="flex overflow-auto scroll--h"
        style={{
          height: `calc(100vh - 75px)`,
        }}
      >
        <div className="grow">
          <Table
            expandable={{
              expandedRowRender: (record?: any, ..._args: any[]) => {
                return (
                  <SlotsContextProvider>
                    <AppointmentDetails doctorId={record?.key} />
                  </SlotsContextProvider>
                );
              },
              expandedRowKeys: [openKey],
              onExpand: (exp?: any, record?: any, ..._args: any[]) =>
                setOpenKey(() => (!exp ? null : record?.key)),
            }}
            pagination={doctorsData?.length > 4 ? { pageSize: 4 } : false}
            columns={columns as any}
            loading={isLoading}
            dataSource={doctorsDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorManagement;
