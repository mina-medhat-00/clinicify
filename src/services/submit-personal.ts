import axios from "axios";
import Cookies from "universal-cookie";
import { apiUrl } from "@/utils/api";

const cookies = new Cookies();
export default async function submitPersonal(
  values?: any,
  messageApi?: any,
  fetchProfileData?: any,
  fetchUserData?: any,
  userName?: any,
  isEdit?: any,
) {
  const data = {
    values: {
      ...values,
      birth: `${values?.birth?.year()}-${values?.birth?.month() + 1}-${values?.birth?.date()}`,
    },
    isEdit,
  };
  messageApi.open({
    key: 1,
    content: "submitting your information ...",
    type: "loading",
    duration: 8,
  });
  axios
    .post(
      apiUrl("/submit/personal"),
      {
        data,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.get("accessToken")}`,
        },
      },
    )
    .then(function () {
      messageApi.open({
        key: 1,
        content: "your information updated",
        type: "success",
        duration: 2,
      });
      setTimeout(function () {
        fetchProfileData({ path: "profile", username: userName }, true);
      }, 2000);
    })
    .catch(function (err?: any, ..._args: any[]) {
      if (err?.response?.status == 401) {
        fetchUserData(true, cookies.get("accessToken"));
      } else
        messageApi.open({
          key: 1,
          content: "there's some issues cannot submit your feedback now",
          type: "error",
          duration: 2,
        });
    });
}
