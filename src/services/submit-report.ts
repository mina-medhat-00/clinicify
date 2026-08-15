import axios from "axios";
import Cookies from "universal-cookie";

const cookies = new Cookies();
const submitReport = (issue?: any, reportType?: any, messageApi?: any, fetchUserData?: any, form?: any, ..._args: any[]) => {
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
  const host = window?.location?.hostname;
  axios
    .post(`http://${host}:5000/submit/report`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookies.get("accessToken")}`,
      },
    })
    .then(() => {
      messageApi.open({
        key: 1,
        type: "success",
        content: "Your issue sent to administrator, wait for answer",
        duration: 3,
      });
      form?.resetFields();
    })
    .catch((err?: any, ..._args: any[]) => {
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
};

export default submitReport;
