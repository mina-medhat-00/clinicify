import axios from "axios";
import Cookies from "universal-cookie";
import { apiUrl } from "@/utils/api";

const cookies = new Cookies();
export default async function submitFeedback(
  rateValue?: any,
  feedbackValue?: any,
  feedback_to?: any,
  messageApi?: any,
  setFetchFeedback?: any,
  fetchUserData?: any,
) {
  const data = {
    rate: rateValue || 0,
    feedback: feedbackValue || null,
    feedback_to,
  };
  messageApi.open({
    key: 1,
    content: "submitting your feedback ...",
    type: "loading",
    duration: 8,
  });
  axios
    .post(
      apiUrl("/submit/feedback"),
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
    .then(function (res?: any) {
      if (!res?.data?.data?.update)
        messageApi.open({
          key: 1,
          content: "thank you for your feedback",
          type: "success",
          duration: 2,
        });
      else
        messageApi.open({
          key: 1,
          content: "thank you for your feedback update",
          type: "success",
          duration: 2,
        });
      setFetchFeedback(function (val?: any) {
        return !val;
      });
    })
    .catch(function (err?: any) {
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
