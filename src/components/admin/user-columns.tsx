import { Search, Stethoscope, User, UserRound } from "lucide-react";
import { useRef, type Key, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button, Input, Space } from "@/components/ui/controls";
import type {
  FilterDropdownProps,
  FilterValue,
  TableColumn,
} from "@/components/ui/table";
import UserAvatar from "@/components/ui/user-avatar";
import type { UserType } from "@/types/user";

export interface NameValue {
  nick_name: string;
  img_url?: string | null;
  user_type?: UserType;
}

export interface NamedRow {
  key: Key;
  name: NameValue;
}

const typeFilters: { text: UserType; value: UserType }[] = [
  { text: "doctor", value: "doctor" },
  { text: "user", value: "user" },
  { text: "admin", value: "admin" },
];

const typeIcons: Record<UserType, ReactNode> = {
  doctor: <Stethoscope />,
  user: <User />,
  admin: <UserRound />,
};

function matches(value: FilterValue, text: string) {
  return text.toLowerCase().includes(String(value).toLowerCase());
}

// The "Name" column: avatar and nickname linking to the profile, with a
// search box that filters by nickname.
export function useNameColumn({
  cardClass,
  avatarUserType,
}: {
  cardClass: string;
  // Force one avatar icon (the doctors table); otherwise use the row's type.
  avatarUserType?: UserType;
}): TableColumn<NamedRow> {
  const searchInput = useRef<HTMLInputElement>(null);
  return {
    title: "Name",
    dataIndex: "name",
    key: "name",
    filterDropdown: function ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }: FilterDropdownProps) {
      const [current] = selectedKeys;
      return (
        <div
          className="p-2"
          onKeyDown={function (event) {
            event.stopPropagation();
          }}
        >
          <Input
            ref={searchInput}
            placeholder="Search name"
            value={typeof current === "string" ? current : ""}
            onChange={function (event) {
              setSelectedKeys(event.target.value ? [event.target.value] : []);
            }}
            onPressEnter={confirm}
            className="mb-2 block"
          />
          <Space>
            <Button
              type="primary"
              className="flex items-center justify-center w-24"
              onClick={confirm}
              icon={<Search className="size-4" />}
              size="small"
            >
              Search
            </Button>
            <Button onClick={clearFilters} size="small" className="w-24">
              Reset
            </Button>
            <Button type="link" size="small" onClick={close}>
              close
            </Button>
          </Space>
        </div>
      );
    },
    filterIcon: function (filtered: boolean) {
      return <Search className={filtered ? "text-blue-500" : undefined} />;
    },
    onFilter: function (value: FilterValue, record: NamedRow) {
      return matches(value, record.name.nick_name);
    },
    filterDropdownProps: {
      onOpenChange: function (visible: boolean) {
        if (visible)
          setTimeout(function () {
            searchInput.current?.select();
          }, 100);
      },
    },
    render: function (name: NameValue, record: NamedRow) {
      return (
        <Link
          to={`/profile/${String(record.key)}`}
          className={`flex flex-col px-4 py-2 text-center rounded-md shadow-md justify-center items-center gap-2 ${cardClass}`}
        >
          <UserAvatar
            className={avatarUserType ? undefined : "bg-gray-700/80"}
            size="large"
            src={name.img_url}
            userType={avatarUserType ?? name.user_type}
          />
          <span className="font-medium text-gray-700">{name.nick_name}</span>
        </Link>
      );
    },
  };
}

// The "Type" column, filterable by account type.
export interface TypedRow {
  user_type: UserType;
}

export function userTypeColumn(cardClass: string): TableColumn<TypedRow> {
  return {
    title: "Type",
    dataIndex: "user_type",
    key: "user_type",
    filters: typeFilters,
    onFilter: function (value: FilterValue, record: TypedRow) {
      return String(value).toLowerCase() === record.user_type.toLowerCase();
    },
    render: function (value: UserType) {
      return (
        <div
          className={`flex px-1 py-2 shadow-md rounded-md flex-col justify-center gap-2 items-center ${cardClass}`}
        >
          {typeIcons[value]}
          <span className="font-medium capitalize">{value}</span>
        </div>
      );
    },
  };
}
