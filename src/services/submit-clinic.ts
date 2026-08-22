import axios from "axios";
import Cookies from "universal-cookie";
import { apiUrl } from "@/utils/api";

const cookies = new Cookies();
export default async function submitClinic(
  values?: any,
  messageApi?: any,
  fetchProfileData?: any,
  fetchUserData?: any,
  username?: any,
  isEdit?: any,
) {
  const data = { ...values, isEdit };
  messageApi.open({
    key: 1,
    content: "submitting Clinic information ...",
    type: "loading",
    duration: 8,
  });
  axios
    .post(
      apiUrl("/submit/clinic"),
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
        content: "clinic information updated",
        type: "success",
        duration: 2,
      });
      setTimeout(function () {
        fetchProfileData({ path: "profile", username }, true);
      }, 2000);
    })
    .catch(function (err?: any) {
      if (err?.response?.status == 401) {
        fetchUserData(true, cookies.get("accessToken"));
      } else
        messageApi.open({
          key: 1,
          content: "there's some issues cannot submit your information now",
          type: "error",
          duration: 2,
        });
    });
}
