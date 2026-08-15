import { Button, Input, Select } from "antd";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import HeaderLine from "@/components/ui/header-line";
import { doctorSpecialtyOptions } from "@/utils/sign-data";

const opt = (val?: any, ..._args: any[]) =>
  val == "null" || !val ? null : val;
const SearchFilter = forwardRef(
  ({ fetchDoctorsData }: any, ref?: any, ..._args: any[]) => {
    const [searchFilter, setSearchFilter] = useState({
      specialty: opt(window.localStorage.getItem("specialty")) || "",
      doctorName: opt(window.localStorage.getItem("doctorName")) || "",
      location: opt(window.localStorage.getItem("location")) || "",
    });
    const searchElement = useRef(null);
    const [heightSearch, setHeightSearch] = useState(0);
    const [showSearch, setShowSearch] = useState(false);
    useEffect(() => {
      const obs = new ResizeObserver(() =>
        setHeightSearch(searchElement?.current?.offsetHeight),
      );
      obs.observe(searchElement?.current);
    }, []);
    useLayoutEffect(() => {
      if (searchElement.current.style) {
        searchElement.current.style.marginTop = `${
          -searchElement?.current?.offsetHeight - 1
        }px`;
        searchElement.current.style.transition = "none";
        setTimeout(
          () => (searchElement.current.style.transition = "margin 0.2s linear"),
          10,
        );
      }
    }, []);
    useImperativeHandle(
      ref,
      () => ({
        doctorName: searchFilter.doctorName,
        location: searchFilter.location,
        specialtyValue: searchFilter.specialty,
        setSearchFilter,
      }),
      [searchFilter],
    );
    useEffect(() => {
      window.localStorage.setItem("specialty", searchFilter.specialty || "");
      window.localStorage.setItem("doctorName", searchFilter.doctorName || "");
      window.localStorage.setItem("location", searchFilter.location || "");
      fetchDoctorsData({
        specialty: searchFilter.specialty,
        dname: searchFilter.doctorName,
        location: searchFilter.location,
      });
    }, [searchFilter]);
    return (
      <>
        <div
          ref={searchElement}
          className="p-2 shadow-lg rounded-bl-lg mx-2 bg-gray-600"
          style={{
            transition: "all 0.2s linear",
            position: "relative",
            marginTop: `${showSearch ? 0 : -heightSearch - 1}px`,
          }}
        >
          <HeaderLine value="Search For a Doctor" center />
          <div className="flex flex-wrap gap-2">
            <div className="grow w-full sm:w-1/3">
              <HeaderLine
                value="by specialty"
                classLine="w-full sm:w-1/3  h-3"
                size="sm"
                font="medium"
              />
              <Select
                onChange={(val?: any, ..._args: any[]) =>
                  setSearchFilter((searchFilter?: any, ..._args: any[]) => ({
                    ...searchFilter,
                    specialty: val,
                  }))
                }
                value={!searchFilter.specialty ? null : searchFilter.specialty}
                placeholder="choose specialty"
                className="w-full"
                showSearch
                optionFilterProp="label"
                options={[
                  { value: "", label: "All Doctors" },
                  ...doctorSpecialtyOptions,
                ]}
              />
            </div>
            <div className="grow w-full sm:w-1/3">
              <HeaderLine
                value="by doctor name"
                classLine="w-full sm:w-1/3  h-3"
                size="sm"
                font="medium"
              />
              <Input
                onChange={(e?: any, ..._args: any[]) =>
                  setSearchFilter((searchFilter?: any, ..._args: any[]) => ({
                    ...searchFilter,
                    doctorName: e?.target?.value,
                  }))
                }
                value={searchFilter.doctorName}
                placeholder="your doctor name"
              />
            </div>
            <div className="grow w-full sm:w-1/3">
              <HeaderLine
                value="by location"
                classLine="w-full sm:w-1/3  h-3"
                size="sm"
                font="medium"
              />
              <Input
                onChange={(e?: any, ..._args: any[]) =>
                  setSearchFilter((searchFilter?: any, ..._args: any[]) => ({
                    ...searchFilter,
                    location: e?.target?.value,
                  }))
                }
                value={searchFilter.location}
                placeholder="your Location"
              />
            </div>
          </div>
          <div className="flex justify-between mt-3">
            <Button
              type="primary"
              onClick={() => {
                setSearchFilter(() => ({
                  specialty: "",
                  doctorName: "",
                  location: "",
                }));
              }}
              className="bg-red-400 rounded-lg"
            >
              Reset
            </Button>
          </div>
        </div>
        <div
          onClick={() => setShowSearch((val?: any, ..._args: any[]) => !val)}
          style={{
            maxWidth: "50%",
            minWidth: "100px",
          }}
          className="border-gray-700 cursor-pointer hover:bg-gray-800 break-all  rounded-bl-lg rounded-br-lg border-2 p-2 bg-gray-700 block w-fit m-auto"
        >
          <h1 className="text-center my-5 text-2xl sm:text-4xl text-white">
            {" "}
            {searchFilter.doctorName} 🔍 {searchFilter?.specialty}
          </h1>
        </div>
      </>
    );
  },
);

export default SearchFilter;
