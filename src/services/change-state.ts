import Cookies from "universal-cookie";
import axios from "axios";
const cookies = new Cookies();
const changeState = async (
  fetchUserData?: any,
  fetchDoctorsData?: any,
  messageApi?: any,
  setIsLoading?: any,
  type?: any,
  doctorId?: any,
  isUser?: any,
) => {
  messageApi.open({
    key: 1,
    content: `${
      type == "verify"
        ? "Verifying"
        : type == "delete"
          ? "Deleting"
          : type == "reject"
            ? "Rejecting"
            : type == "restrict"
              ? "Restricting"
              : ""
    } ${isUser ? "user" : "doctor"} account ...`,
    type: "loading",
    duration: 8,
  });
  const host = window?.location?.hostname;
  setIsLoading(true);
  axios
    .post(
      `http://${host}:5000/change/${isUser ? "user" : "doctor"}`,
      {
        data: {
          type,
          ...(type == "restrict"
            ? doctorId
            : isUser
              ? { userId: doctorId }
              : { doctorId }),
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookies?.get("accessToken")}`,
        },
      },
    )
    .then(() => {
      messageApi.open({
        key: 1,
        content: `${isUser ? "user" : "doctor"} account ${
          type == "verify"
            ? "has been verified"
            : type == "delete"
              ? "has been deleted"
              : type == "reject"
                ? "has been rejected"
                : type == "restrict"
                  ? "Restricted"
                  : ""
        }`,
        type: "success",
        duration: 4,
      });
      fetchDoctorsData(
        {
          total: true,
        },
        type == "restrict" ? new Cookies().get("accessToken") : true,
        type == "restrict" ? { userid: doctorId?.chat_from } : null,
        type == "restrict" ? true : null,
      );
      setIsLoading(false);
    })
    .catch((err?: any, ..._args: any[]) => {
      setIsLoading(false);
      if (err?.response?.status == 401) {
        fetchUserData(true, cookies.get("accessToken"));
      } else
        messageApi.open({
          key: 1,
          content: "there's some issues cannot submit your operation now",
          type: "error",
          duration: 3,
        });
    });
};

export default changeState;
