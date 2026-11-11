import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Search } from "lucide-react";
import { Button, Input, Select } from "@/components/ui/controls";
import { doctorSpecialtyOptions } from "@/constants/sign-data";
import type { DoctorsQuery } from "@/types/queries";
import type { SearchFilterValues, SearchFilterHandle } from "@/types/user";

function stored(key: keyof SearchFilterValues) {
  let value: string | null = null;
  try {
    value = window.localStorage.getItem(key);
  } catch {
    // Storage may be blocked so start with an empty filter
  }
  return value === null || value === "null" ? "" : value;
}

function storedFilters(): SearchFilterValues {
  return {
    specialty: stored("specialty"),
    doctorName: stored("doctorName"),
    location: stored("location"),
  };
}

function store(values: SearchFilterValues) {
  try {
    window.localStorage.setItem("specialty", values.specialty);
    window.localStorage.setItem("doctorName", values.doctorName);
    window.localStorage.setItem("location", values.location);
  } catch {
    // Storage may be blocked so the filter is not kept
  }
}

export default forwardRef<
  SearchFilterHandle,
  { fetchDoctorsData: (query: DoctorsQuery) => Promise<unknown> }
>(function SearchFilter({ fetchDoctorsData }, ref) {
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
      store(searchFilter);
      // Wait for typing to pause before searching
      const timeId = setTimeout(function () {
        void fetchDoctorsData({
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

  function updateField(name: keyof SearchFilterValues, value: string) {
    setSearchFilter(function (current) {
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
          <Select<string>
            onChange={function (value) {
              updateField("specialty", value);
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
            onChange={function (event) {
              updateField("doctorName", event.target.value);
            }}
            value={searchFilter.doctorName}
            placeholder="Doctor's name"
          />
        </label>
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-sm font-medium text-gray-600">Location</span>
          <Input
            onChange={function (event) {
              updateField("location", event.target.value);
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
