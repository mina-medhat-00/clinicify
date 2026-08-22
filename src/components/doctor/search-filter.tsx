import { Button, Input, Select } from "@/components/ui/kit";
import { Search } from "lucide-react";
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

function opt(val?: any, ..._args: any[]) {
  return val == "null" || !val ? null : val;
}
function SearchFilter({ fetchDoctorsData }: any, ref?: any, ..._args: any[]) {
  const [searchFilter, setSearchFilter] = useState({
    specialty: opt(window.localStorage.getItem("specialty")) || "",
    doctorName: opt(window.localStorage.getItem("doctorName")) || "",
    location: opt(window.localStorage.getItem("location")) || "",
  });
  const searchElement = useRef(null);
  const [heightSearch, setHeightSearch] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  useEffect(function () {
    const obs = new ResizeObserver(function () {
      setHeightSearch(searchElement?.current?.offsetHeight);
    });
    obs.observe(searchElement?.current);
  }, []);
  useLayoutEffect(function () {
    if (searchElement.current.style) {
      searchElement.current.style.marginTop = `${
        -searchElement?.current?.offsetHeight - 1
      }px`;
      searchElement.current.style.transition = "none";
      setTimeout(function () {
        searchElement.current.style.transition = "margin 0.2s linear";
      }, 10);
    }
  }, []);
  useImperativeHandle(
    ref,
    function () {
      return {
        doctorName: searchFilter.doctorName,
        location: searchFilter.location,
        specialtyValue: searchFilter.specialty,
        setSearchFilter,
      };
    },
    [searchFilter],
  );
  useEffect(
    function () {
      window.localStorage.setItem("specialty", searchFilter.specialty || "");
      window.localStorage.setItem("doctorName", searchFilter.doctorName || "");
      window.localStorage.setItem("location", searchFilter.location || "");
      fetchDoctorsData({
        specialty: searchFilter.specialty,
        dname: searchFilter.doctorName,
        location: searchFilter.location,
      });
    },
    [searchFilter],
  );
  return (
    <>
      <div
        ref={searchElement}
        className="relative p-2 shadow-lg rounded-bl-lg mx-2 bg-gray-600 transition-all duration-200"
        style={{
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
              onChange={function (val?: any, ..._args: any[]) {
                setSearchFilter(function (searchFilter?: any, ..._args: any[]) {
                  return {
                    ...searchFilter,
                    specialty: val,
                  };
                });
              }}
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
              onChange={function (e?: any, ..._args: any[]) {
                setSearchFilter(function (searchFilter?: any, ..._args: any[]) {
                  return {
                    ...searchFilter,
                    doctorName: e?.target?.value,
                  };
                });
              }}
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
              onChange={function (e?: any, ..._args: any[]) {
                setSearchFilter(function (searchFilter?: any, ..._args: any[]) {
                  return {
                    ...searchFilter,
                    location: e?.target?.value,
                  };
                });
              }}
              value={searchFilter.location}
              placeholder="your Location"
            />
          </div>
        </div>
        <div className="flex justify-between mt-3">
          <Button
            type="primary"
            onClick={function () {
              setSearchFilter(function () {
                return {
                  specialty: "",
                  doctorName: "",
                  location: "",
                };
              });
            }}
            className="bg-red-400 rounded-lg"
          >
            Reset
          </Button>
        </div>
      </div>
      <div
        onClick={function () {
          setShowSearch(function (val?: any, ..._args: any[]) {
            return !val;
          });
        }}
        className="border-gray-700 cursor-pointer hover:bg-gray-800 break-all  rounded-bl-lg rounded-br-lg border-2 p-2 bg-gray-700 block w-fit m-auto max-w-xs min-w-24"
      >
        <h1 className="text-center my-5 text-2xl sm:text-4xl text-white">
          {" "}
          {searchFilter.doctorName} <Search className="inline size-4" />{" "}
          {searchFilter?.specialty}
        </h1>
      </div>
    </>
  );
}

export default forwardRef(SearchFilter);
