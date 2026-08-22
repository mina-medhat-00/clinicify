import { Button, Input, Space, Table } from "@/components/ui";
import {
  Briefcase,
  Flag,
  Mail,
  Search,
  Stethoscope,
  User,
  UserRound,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReportDetails from "@/components/admin/report-details";
import PopUp from "@/components/ui/pop-up";
import UserAvatar from "@/components/ui/user-avatar";
import ReportContextProvider, {
  useReportContext,
} from "@/contexts/report-context";

export default function AdminReports() {
  const [selectedUser, setSelectedUser] = useState<any>("");
  const [showPop, setShowPop] = useState(false);
  const { isLoading: isReportLoading, reportData } = useReportContext();
  const searchInput = useRef(null);
  function handleSearch(confirm?: any, ..._args: any[]) {
    confirm();
  }
  function handleReset(clearFilters?: any, ..._args: any[]) {
    clearFilters();
  }
  function getColumnSearchProps(dataIndex?: any, ..._args: any[]) {
    return {
      filterDropdown: function ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
        close,
      }: any) {
        return (
          <div
            className="p-2"
            onKeyDown={function (e?: any, ..._args: any[]) {
              e.stopPropagation();
            }}
          >
            <Input
              ref={searchInput}
              placeholder={`Search ${dataIndex}`}
              value={selectedKeys[0]}
              onChange={function (e?: any, ..._args: any[]) {
                setSelectedKeys(e.target.value ? [e.target.value] : []);
              }}
              onPressEnter={function () {
                handleSearch(selectedKeys, confirm, dataIndex);
              }}
              className="mb-2 block"
            />
            <Space>
              <Button
                type="primary"
                className="flex items-center justify-center w-24"
                onClick={function () {
                  handleSearch(selectedKeys, confirm, dataIndex);
                }}
                icon={<Search className="size-4" />}
                size="small"
              >
                Search
              </Button>
              <Button
                onClick={function () {
                  clearFilters && handleReset(clearFilters);
                }}
                size="small"
                className="w-24"
              >
                Reset
              </Button>
              <Button
                type="link"
                size="small"
                onClick={function () {
                  close();
                }}
              >
                close
              </Button>
            </Space>
          </div>
        );
      },
      filterIcon: function (filtered?: any, ..._args: any[]) {
        return <Search className={filtered ? "text-blue-500" : undefined} />;
      },
      onFilter: function (value?: any, record?: any, ..._args: any[]) {
        return record[dataIndex].nick_name
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      },
      filterDropdownProps: {
        onOpenChange: function (visible?: any, ..._args: any[]) {
          if (visible) {
            setTimeout(function () {
              searchInput.current?.select();
            }, 100);
          }
        },
      },
    };
  }
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ...getColumnSearchProps("name"),
      render: function (rec?: any, record?: any, ..._args: any[]) {
        return (
          <Link
            to={`/profile/${record?.key}`}
            className="flex flex-col bg-gray-200/80 hover:bg-gray-100/80  px-4 py-2 text-center rounded-md shadow-md justify-center items-center gap-2"
          >
            <UserAvatar
              className={"bg-gray-700/80"}
              size="large"
              src={rec?.img_url}
              userType={rec?.user_type}
            />
            <span className="font-medium text-gray-700">{rec?.nick_name}</span>
          </Link>
        );
      },
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
      onFilter: function (val?: any, rec?: any, ..._args: any[]) {
        return val?.toLowerCase() == rec?.user_type?.toLowerCase();
      },
      render: function (value?: any, ..._args: any[]) {
        return (
          <div className="flex px-1 py-2 bg-blue-400/80 shadow-md  rounded-md flex-col justify-center gap-2 items-center">
            {value == "doctor" ? (
              <Stethoscope />
            ) : value == "doctor" ? (
              <User />
            ) : value == "admin" ? (
              <UserRound />
            ) : (
              <Briefcase />
            )}
            <span className="font-medium capitalize">{value}</span>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
    },
  ];

  const reportValues = reportData?.map(function ({
    user_id,
    img_url,
    nick_name,
    user_type,
  }: any) {
    return {
      key: user_id,
      user_type,
      action: (
        <div className="flex flex-col gap-2 items-center">
          <Button
            onClick={function () {
              setSelectedUser({
                user_id,
                img_url,
                nick_name,
                user_type,
              });
              setShowPop(true);
            }}
            className="bg-red-400 hover:bg-red-500 rounded-lg font-medium text-white"
          >
            <div className="flex items-center gap-2">
              Show Reports <Flag />
            </div>
          </Button>
          <Link
            to={"/chat"}
            onClick={function () {
              window.localStorage.setItem("chatTo", user_id);
            }}
            className="p-2 bg-blue-400 border hover:bg-blue-600/80 rounded-lg font-medium text-white"
          >
            <div className="flex items-center gap-2">
              Answer him <Mail />
            </div>
          </Link>
        </div>
      ),
      name: {
        nick_name,
        img_url,
        user_type,
      },
    };
  });
  return (
    <div className="px-4 admin--table">
      <PopUp
        mt="80px"
        customWidth={"w-5/6 sm:w-4/5 lg:w-3/4"}
        handleClose={function () {
          setShowPop(null);
        }}
        show={showPop}
      >
        <ReportContextProvider reportFrom={selectedUser?.user_id}>
          <ReportDetails
            selectedUser={{
              user_id: selectedUser?.user_id,
              nick_name: selectedUser?.nick_name,
              img_url: selectedUser?.img_url,
              user_type: selectedUser?.user_type,
            }}
          ></ReportDetails>
        </ReportContextProvider>
      </PopUp>
      <div className="flex overflow-auto scroll--h h-screen">
        <div className="grow">
          <Table
            className="reports--table"
            pagination={
              reportData?.length > 4
                ? {
                    pageSize: 4,
                  }
                : false
            }
            columns={columns as any}
            loading={isReportLoading}
            dataSource={reportValues}
          />
        </div>
      </div>
    </div>
  );
}
