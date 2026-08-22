import { City, Country } from "country-state-city";
import { data as isoCurrencies } from "currency-codes";
import getSymbolFromCurrency from "currency-symbol-map";
import type { SelectProps } from "@/components/ui";

type SelectOptions = NonNullable<SelectProps["options"]>;

function toOptions(values: readonly string[]): SelectOptions {
  return [...new Set(values.filter(Boolean))]
    .sort(function (a, b) {
      return a.localeCompare(b);
    })
    .map(function (value) {
      return { value, label: value };
    });
}

export const cityOptions = toOptions(
  City.getCitiesOfCountry("EG")?.map(function (city) {
    return city.name;
  }) ?? [],
);

export const doctorSpecialties = [
  "Anatomical pathology",
  "Anesthesiology",
  "Cardiology",
  "Cardiothoracic surgery",
  "Clinical chemistry",
  "Clinical pathology",
  "Colorectal surgery",
  "Dermatology",
  "Developmental-Behavioral Pediatrics",
  "Diagnostic Radiology",
  "Emergency medicine",
  "Endocrinology",
  "Family medicine",
  "Gastroenterology",
  "General surgery",
  "Geriatrics",
  "Hematology",
  "Immunology",
  "Intensive care medicine",
  "Internal medicine",
  "Medical genetics",
  "Medical microbiology",
  "Nephrology",
  "Neurology",
  "Neurosurgery",
  "Nuclear medicine",
  "Obstetrics and gynaecology",
  "Occupational medicine",
  "Oncology",
  "Ophthalmology",
  "Oral and maxillofacial surgery",
  "Orthopedics",
  "Otorhinolaryngology",
  "Pain management",
  "Pathology",
  "Pediatric Hematology Oncology",
  "Pediatric surgery",
  "Pediatrics",
  "Physical therapy",
  "Plastic surgery",
  "Preventive healthcare",
  "Primary care",
  "Psychiatry",
  "Public health",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Spinal Cord Injury Medicine",
  "Surgery",
  "Urology",
  "Vascular surgery",
] as const;

export const doctorSpecialtyOptions = toOptions(doctorSpecialties);

function getPhonePrefixOptions(): SelectOptions {
  const seen = new Set<string>();
  return Country.getAllCountries()
    .flatMap(function (country) {
      const callingCode = country.phonecode?.replace(/\D/g, "");
      if (!callingCode || seen.has(callingCode)) return [];
      seen.add(callingCode);
      return [
        {
          value: callingCode,
          label: `+${callingCode} ${country.isoCode}`,
        },
      ];
    })
    .sort(function (a, b) {
      return a.label.localeCompare(b.label);
    });
}

export const phonePrefixOptions: SelectOptions = getPhonePrefixOptions();

export const currencyOptions: SelectOptions = isoCurrencies
  .map(function (currency) {
    const symbol = getSymbolFromCurrency(currency.code);
    return {
      value: currency.code,
      label: symbol ? `${currency.currency} - ${symbol}` : currency.currency,
    };
  })
  .sort(function (a, b) {
    return String(a.label).localeCompare(String(b.label));
  });
