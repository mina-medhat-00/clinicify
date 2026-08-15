import axios from "axios";
import { createContext, useState, useContext } from "react";
const handleQuery = (obj?: any, ..._args: any[]) =>
  !obj
    ? ""
    : Object.entries(obj)
        .filter(([_, val]: any) => val || val === 0)
        .map(([name, val]: any, i?: any, ..._args: any[]) =>
          i == 0 ? `?${name}=${val}` : `${name}=${val}`,
        )
        .join("&");
const CommentsData = createContext<any>(null);
const CommentsContextProvider = ({ children }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [commentsData, setCommentsData] = useState(null);
  const host = window?.location?.hostname;
  const fetchCommentsData = async (query?: any, noRender?: any, ..._args: any[]) => {
    if (!noRender) setIsLoading(true);
    try {
      const { data } = await axios.request({ url: `http://${host}:5000/get/comments${handleQuery(query)}`, ...{
          timeout: 10000,
        } });
      setCommentsData(() => data?.data);
      setIsError(false);
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      setIsError(true);
      throw err;
    }
  };

  return (
    <CommentsData.Provider
      value={{
        isLoading,
        commentsData,
        setCommentsData,
        fetchCommentsData,
        isError,
      }}
    >
      {children}
    </CommentsData.Provider>
  );
};

export default CommentsContextProvider;

export const useCommentsContext = () => useContext(CommentsData);
