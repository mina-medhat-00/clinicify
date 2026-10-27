import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Search } from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { doctorSpecialtyOptions } from "@/utils/sign-data";

function opt(val?: any) {
  return val == "null" || !val ? null : val;
}

function storedFilters() {
  return {
    specialty: opt(window.localStorage.getItem("specialty")) || "",
    doctorName: opt(window.localStorage.getItem("doctorName")) || "",
    location: opt(window.localStorage.getItem("location")) || "",
  };
}

export default forwardRef(function SearchFilter(
  { fetchDoctorsData }: any,
  ref?: any,
) {
  const [searchFilter, setSearchFilter] = useState(storedFilters);

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
      // Wait for typing to pause before searching.
      const timeId = setTimeout(function () {
        fetchDoctorsData({
          specialty: searchFilter.specialty,
          dname: searchFilter.doctorName,
          location: searchFilter.location,
        });
      }, 300);
      return function () {
        clearTimeout(timeId);
      };
    },
    [searchFilter, fetchDoctorsData],
  );

  function updateField(name?: any, value?: any) {
    setSearchFilter(function (current?: any) {
      return { ...current, [name]: value };
    });
  }

  return (
    <section className="relative z-10 m-2 rounded-lg bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-gray-700">
        <Search className="size-4 shrink-0" />
        <h2 className="text-base font-medium">Search for a doctor</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">Specialty</span>
          <Select
            onChange={function (val?: any) {
              updateField("specialty", val);
            }}
            value={searchFilter.specialty || null}
            placeholder="All specialties"
            className="w-full"
            showSearch
            optionFilterProp="label"
            options={[
              { value: "", label: "All Doctors" },
              ...doctorSpecialtyOptions,
            ]}
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">Doctor name</span>
          <Input
            onChange={function (e?: any) {
              updateField("doctorName", e?.target?.value);
            }}
            value={searchFilter.doctorName}
            placeholder="Doctor's name"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">Location</span>
          <Input
            onChange={function (e?: any) {
              updateField("location", e?.target?.value);
            }}
            value={searchFilter.location}
            placeholder="City or area"
          />
        </label>
      </div>
      <div className="mt-3">
        <Button
          type="primary"
          onClick={function () {
            setSearchFilter({
              specialty: "",
              doctorName: "",
              location: "",
            });
          }}
          className="bg-red-400 hover:bg-red-500"
        >
          Reset
        </Button>
      </div>
    </section>
  );
});
