import axios from "axios";
import { createContext, useState, useContext, useLayoutEffect } from "react";

const DoctorsData = createContext<any>(null);
const DoctorsContextProvider = ({ children, query, noFirstRender }: any) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [doctorsData, setDoctorsData] = useState(null);
  const host = window?.location?.hostname;
  const fetchDoctorsData = async (setQuery?: any, noWaiting?: any, ..._args: any[]) => {
    const activeQuery = setQuery ? setQuery : query;
    if (!noWaiting) setIsLoading(true);
    try {
      const { data } = await axios.request({ url: `http://${host}:5000/doctors${
          activeQuery
            ? `?${activeQuery.total ? `total=${activeQuery.total}&` : ""}${
                activeQuery.limit ? `limit=${activeQuery.limit}&` : ""
              }${
                activeQuery.specialty
                  ? `specialty=${activeQuery.specialty}&`
                  : ""
              }${activeQuery.dname ? `dname=${activeQuery.dname}&` : ""}${
                activeQuery.location ? `location=${activeQuery.location}&` : ""
              }`
            : ""
        }`, ...{ timeout: 10000 } });
      setDoctorsData(data?.data);
      setIsError(false);
      setIsLoading(false);
      return data;
    } catch (err) {
      setDoctorsData(null);
      setIsError(true);
      setIsLoading(false);
    }
  };
  useLayoutEffect(() => {
    if (!noFirstRender) fetchDoctorsData(query);
  }, []);
  return (
    <DoctorsData.Provider
      value={{ isLoading, isError, doctorsData, fetchDoctorsData }}
    >
      {children}
    </DoctorsData.Provider>
  );
};

export default DoctorsContextProvider;

export const useDoctorsContext = () => useContext(DoctorsData);
