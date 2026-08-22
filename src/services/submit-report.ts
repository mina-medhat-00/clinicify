import axios from "axios";
import Cookies from "universal-cookie";
import { apiUrl } from "@/utils/api";

const cookies = new Cookies();
export default function submitReport(
  issue?: any,
  reportType?: any,
  messageApi?: any,
  fetchUserData?: any,
  form?: any,
) {
  const data = {
    data: {
      reportType,
      issue,
    },
  };
  messageApi.open({
    key: 1,
    type: "loading",
    content: `submitting your issue...`,
    duration: 8,
  });
  axios
    .post(apiUrl("/submit/report"), data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("accessToken")}`,
      },
    })
    .then(function () {
      messageApi.open({
        key: 1,
        type: "success",
        content: "Your issue sent to administrator, wait for answer",
        duration: 3,
      });
      form?.resetFields();
    })
    .catch(function (err?: any) {
      if (err?.response?.status == 401) {
        fetchUserData(true, cookies.get("accessToken"));
      } else
        messageApi.open({
          key: 1,
          type: "error",
          content: "there's some issues, please try again later",
          duration: 5,
        });
    });
}
