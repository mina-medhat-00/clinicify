import { Button } from "@/components/ui/controls";
import { Table, type TableColumn } from "@/components/ui/table";
import { Mars, Venus } from "lucide-react";
import { useState, type ReactNode } from "react";
import Restrictions from "@/components/admin/restrictions";
import {
  useNameColumn,
  userTypeColumn,
  type NamedRow,
} from "@/components/admin/user-columns";
import PopUp from "@/components/ui/pop-up";
import { useUserContext } from "@/contexts/user-context";
import { useUsersContext } from "@/contexts/users-context";
import changeState from "@/services/change-state";
import type { ManagedUser, UserType } from "@/types/user";

interface UserRow extends NamedRow {
  user_type: UserType;
  gender: string;
  age: number;
  action: ReactNode;
}

export default function UserManagement() {
  // The user whose chat restrictions are shown (kept while the popup closes).
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showRestrictions, setShowRestrictions] = useState(false);
  const nameColumn = useNameColumn({
    cardClass: "bg-gray-100/80 hover:bg-gray-200/80",
  });
  const columns: TableColumn<UserRow>[] = [
    nameColumn,
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
        { text: "male", value: "male" },
        { text: "female", value: "female" },
      ],
      onFilter: function (value, record) {
        return String(value).toLowerCase() === record.gender.toLowerCase();
      },
      render: function (value) {
        return (
          <div className="flex flex-col bg-gray-600/80 shadow-md px-1 py-2 rounded-md justify-center gap-2 items-center">
            {value === "male" ? (
              <Mars className="text-white" />
            ) : (
              <Venus className="text-white" />
            )}
            <span className="font-medium capitalize">{value}</span>
          </div>
        );
      },
    },
    userTypeColumn("bg-gray-600/80"),
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
    },
  ];

  const { fetchUserData, messageApi } = useUserContext();
  const { usersData, isLoading, fetchUsersData } = useUsersContext();
  // The user waiting for delete confirmation.
  const [pendingDelete, setPendingDelete] = useState<ManagedUser | null>(null);
  function deleteUser() {
    const user = pendingDelete;
    setPendingDelete(null);
    if (!user) return;
    void changeState({
      action: "delete",
      target: "user",
      id: user.user_id,
      messageApi,
      fetchUserData,
    }).then(function (changed) {
      if (changed) void fetchUsersData(undefined, { silent: true });
    });
  }
  const usersDetails = usersData?.map(function (user): UserRow {
    const { user_id, img_url, nick_name, user_type, gender, age } = user;
    return {
      key: user_id,
      user_type,
      gender,
      age,
      action: (
        <div className="flex flex-col gap-2 items-center">
          <Button
            onClick={function () {
              setPendingDelete(user);
            }}
            className="bg-blue-400 hover:bg-blue-600 rounded-lg font-medium text-white"
          >
            Delete
          </Button>
          <Button
            onClick={function () {
              setSelectedUser(user);
              setShowRestrictions(true);
            }}
            className="bg-red-400 hover:bg-red-600 rounded-lg font-medium text-white"
          >
            Restrict
          </Button>
        </div>
      ),
      name: { nick_name, img_url, user_type },
    };
  });

  return (
    <div className="px-4 admin--table">
      <PopUp
        show={Boolean(pendingDelete)}
        handleClose={function () {
          setPendingDelete(null);
        }}
        closeColor="text-red-800/80 hover:text-red-800"
      >
        <div className="text-center text-sm sm:text-lg p-2 bg-blue-400 text-white font-medium rounded-lg">
          Delete {pendingDelete?.nick_name}'s account?
          <br /> This can't be undone.
        </div>
        <div className="flex justify-center gap-2 p-2 mt-4">
          <button
            type="button"
            onClick={deleteUser}
            className="cursor-pointer text-center bg-red-500 p-2 grow text-white font-medium rounded-lg shadow-sm"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={function () {
              setPendingDelete(null);
            }}
            className="cursor-pointer text-center bg-blue-400 p-2 text-white font-medium rounded-lg shadow-sm"
          >
            Cancel
          </button>
        </div>
      </PopUp>
      <PopUp
        mt="80px"
        customWidth="w-5/6 sm:w-4/5 lg:w-3/4"
        handleClose={function () {
          setShowRestrictions(false);
        }}
        show={showRestrictions}
      >
        {selectedUser && <Restrictions selectedUser={selectedUser} />}
      </PopUp>
      <div className="flex overflow-auto scroll--h h-screen">
        <div className="grow">
          <Table<UserRow>
            className="users--table"
            pagination={(usersData?.length ?? 0) > 4 ? { pageSize: 4 } : false}
            columns={columns}
            loading={isLoading}
            dataSource={usersDetails}
          />
        </div>
      </div>
    </div>
  );
}
