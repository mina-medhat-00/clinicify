import { Form } from "@/components/ui/form";
import { Select } from "@/components/ui/controls";
import { currencyOptions, phonePrefixOptions } from "@/constants/sign-data";

const prefixSelector = (
  <Form.Item name="prefix" noStyle rules={[{ required: true }]}>
    <Select
      className="flex w-28 items-center whitespace-nowrap bg-gray-100"
      showSearch
      optionFilterProp="label"
      options={phonePrefixOptions}
    />
  </Form.Item>
);

const suffixSelector = (
  <Form.Item name="suffix" noStyle className="bg-gray-100">
    <Select
      className="w-16"
      showSearch
      optionFilterProp="label"
      options={currencyOptions}
    />
  </Form.Item>
);

export { prefixSelector, suffixSelector };
