import { Button } from "@/components/ui/controls";
import { Table, type TableColumn } from "@/components/ui/table";
import { Flag, Mail } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ReportDetails from "@/components/admin/report-details";
import {
  useNameColumn,
  userTypeColumn,
  type NamedRow,
} from "@/components/admin/user-columns";
import PopUp from "@/components/ui/pop-up";
import ReportContextProvider, {
  useReportContext,
} from "@/contexts/report-context";
import type { ReportSummary } from "@/types/content";
import type { UserType } from "@/types/user";

interface ReportRow extends NamedRow {
  user_type: UserType;
  action: ReactNode;
}

export default function AdminReports() {
  // The user whose reports are shown (kept while the popup closes).
  const [selectedUser, setSelectedUser] = useState<ReportSummary | null>(null);
  const [showPop, setShowPop] = useState(false);
  const { isLoading: isReportLoading, summaries } = useReportContext();
  const nameColumn = useNameColumn({
    cardClass: "bg-gray-200/80 hover:bg-gray-100/80",
  });
  const columns: TableColumn<ReportRow>[] = [
    nameColumn,
    userTypeColumn("bg-blue-400/80"),
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
    },
  ];

  const reportValues = summaries?.map(function (report): ReportRow {
    const { user_id, img_url, nick_name, user_type } = report;
    return {
      key: user_id,
      user_type,
      action: (
        <div className="flex flex-col gap-2 items-center">
          <Button
            onClick={function () {
              setSelectedUser(report);
              setShowPop(true);
            }}
            className="bg-red-400 hover:bg-red-500 rounded-lg font-medium text-white"
          >
            <div className="flex items-center gap-2">
              Show Reports <Flag />
            </div>
          </Button>
          <Link
            to="/chat"
            onClick={function () {
              window.localStorage.setItem("chatTo", String(user_id));
            }}
            className="p-2 bg-blue-400 border hover:bg-blue-600/80 rounded-lg font-medium text-white"
          >
            <div className="flex items-center gap-2">
              Answer him <Mail />
            </div>
          </Link>
        </div>
      ),
      name: { nick_name, img_url, user_type },
    };
  });
  return (
    <div className="px-4 admin--table">
      <PopUp
        mt="80px"
        customWidth="w-5/6 sm:w-4/5 lg:w-3/4"
        handleClose={function () {
          setShowPop(false);
        }}
        show={showPop}
      >
        {selectedUser && (
          <ReportContextProvider reportFrom={selectedUser.user_id}>
            <ReportDetails />
          </ReportContextProvider>
        )}
      </PopUp>
      <div className="flex overflow-auto scroll--h h-screen">
        <div className="grow">
          <Table<ReportRow>
            className="reports--table"
            pagination={(summaries?.length ?? 0) > 4 ? { pageSize: 4 } : false}
            columns={columns}
            loading={isReportLoading}
            dataSource={reportValues}
          />
        </div>
      </div>
    </div>
  );
}
