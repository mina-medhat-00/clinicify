import { SearchOutlined } from "@ant-design/icons";
import { Avatar, Button, Input, Space, Table } from "antd";
import { useRef, useState } from "react";
import { BsGenderFemale, BsGenderMale } from "react-icons/bs";
import { FaRegUser, FaUserSecret, FaUserTie } from "react-icons/fa";
import { GiDoctorFace } from "react-icons/gi";
import { Link } from "react-router-dom";
import doctorPhoto from "@/assets/images/doctor-photo.png";
import userPhoto from "@/assets/images/user-photo.png";
import Restrictions from "@/components/admin/restrictions";
import PopUp from "@/components/ui/pop-up";
import { useUserContext } from "@/contexts/user-context";
import { useUsersContext } from "@/contexts/users-context";
import changeState from "@/services/change-state";

const UserManagement = (_props?: any) => {
  const [selectedUser, setSelectedUser] = useState<any>("");
  const [showPop, setShowPop] = useState(false);
  const searchInput = useRef(null);
  const handleSearch = (
    _selectedKeys?: any,
    confirm?: any,
    ..._args: any[]
  ) => {
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
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            className="flex items-center justify-center"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
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
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
      render: (rec?: any, record?: any, ..._args: any[]) => (
        <Link
          to={`/profile/${record?.key}`}
          className="flex flex-col bg-gray-100/80 hover:bg-gray-200/80  px-4 py-2 text-center rounded-md shadow-md justify-center items-center gap-2"
        >
          <Avatar
            className={"bg-gray-700/80"}
            size="large"
            src={rec?.img_url}
          />
          <span className="font-medium text-gray-700">{rec?.nick_name}</span>
        </Link>
      ),
    },
    {
      title: "Age",
      key: "age",
      dataIndex: "age",
    },
    {
      title: "Gender",
      key: "gender",
      dataIndex: "gender",
      filters: [
        {
          text: "male",
          value: "male",
        },
        {
          text: "female",
          value: "female",
        },
      ],
      onFilter: (val?: any, rec?: any, ..._args: any[]) =>
        val?.toLowerCase() == rec?.gender?.toLowerCase(),
      render: (value?: any, ..._args: any[]) => (
        <div className="flex flex-col bg-gray-600/80 shadow-md px-1 py-2 rounded-md justify-center gap-2 items-center">
          {value == "male" ? (
            <BsGenderMale fill="white" />
          ) : (
            <BsGenderFemale fill="white" />
          )}
          <span className="font-medium capitalize">{value}</span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "user_type",
      key: "user_type",
      filters: [
        {
          text: "doctor",
          value: "doctor",
        },
        {
          text: "user",
          value: "user",
        },
        {
          text: "admin",
          value: "admin",
        },
      ],
      onFilter: (val?: any, rec?: any, ..._args: any[]) =>
        val?.toLowerCase() == rec?.user_type?.toLowerCase(),
      render: (value?: any, ..._args: any[]) => (
        <div className="flex px-1 py-2 bg-gray-600/80 shadow-md  rounded-md flex-col justify-center gap-2 items-center">
          {value == "doctor" ? (
            <GiDoctorFace />
          ) : value == "doctor" ? (
            <FaRegUser />
          ) : value == "admin" ? (
            <FaUserSecret />
          ) : (
            <FaUserTie />
          )}
          <span className="font-medium capitalize">{value}</span>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
    },
  ];

  const { fetchUserData, messageApi } = useUserContext();
  const { usersData, isLoading, fetchUsersData } = useUsersContext();
  const [, setIsLoading] = useState(false);
  const usersDetails = usersData?.map(
    ({ user_id, img_url, nick_name, user_type, gender, bdate }: any) => ({
      key: user_id,
      user_type,
      gender,
      age: (new Date(bdate).getTime() / (1000 * 60 * 60 * 24 * 365)).toFixed(),
      action: (
        <div className="flex flex-col gap-2 items-center">
          {
            <Button
              onClick={() => {
                changeState(
                  fetchUserData,
                  fetchUsersData,
                  messageApi,
                  setIsLoading,
                  "delete",
                  user_id,
                  true,
                );
              }}
              className="bg-blue-400 hover:bg-blue-600 rounded-lg font-medium text-white"
            >
              Delete
            </Button>
          }
          {
            <Button
              onClick={() => {
                setSelectedUser({
                  user_id,
                  img_url:
                    img_url ||
                    (user_type == "doctor" ? doctorPhoto : userPhoto),
                  nick_name,
                  user_type,
                });
                setShowPop(true);
              }}
              className="bg-red-400 hover:bg-red-600 rounded-lg font-medium text-white"
            >
              Restrict
            </Button>
          }
        </div>
      ),
      name: {
        nick_name,
        img_url: img_url || (user_type == "doctor" ? doctorPhoto : userPhoto),
      },
    }),
  );

  return (
    <div className="px-4 admin--table">
      <PopUp
        mt="80px"
        customWidth={"w-5/6 sm:w-4/5 lg:w-3/4"}
        handleClose={() => setShowPop(null)}
        show={showPop}
      >
        <Restrictions
          selectedUser={{
            user_id: selectedUser?.user_id,
            nick_name: selectedUser?.nick_name,
            img_url: selectedUser?.img_url,
            user_type: selectedUser?.user_type,
          }}
        />
      </PopUp>
      <div
        className="flex overflow-auto scroll--h"
        style={{
          height: `calc(100vh - 75px)`,
        }}
      >
        <div className="grow">
          <Table
            className="users--table"
            pagination={
              usersData?.length > 4
                ? {
                    pageSize: 4,
                  }
                : false
            }
            columns={columns as any}
            loading={isLoading}
            dataSource={usersDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
