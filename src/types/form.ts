import type { ReactNode, ReactElement, FormHTMLAttributes } from "react";

export type NamePath = string | (string | number)[];

export type FormValues = Record<string, unknown>;

export type ControlSize = "small" | "middle" | "large";

export type Bag = Record<string | number, unknown>;

export interface Rule {
  required?: boolean;
  message?: string;
  pattern?: RegExp;
  type?: "email";
  validator?: (rule: Rule, value: unknown) => Promise<void> | void;
}

export type RuleFactory = (form: {
  getFieldValue: (name: NamePath) => unknown;
}) => Rule;

export interface FieldMeta {
  name: NamePath;
  validate: () => Promise<void>;
}

export interface FormInstance<T extends object = FormValues> {
  getFieldsValue: () => T;
  getFieldValue: (name: NamePath) => unknown;
  setFieldsValue: (next: Partial<T>) => void;
  resetFields: () => void;
  setInitial: (next: Partial<T>) => void;
  setValue: (name: NamePath, value: unknown) => void;
  register: (key: string, meta: FieldMeta) => () => void;
  getFields: () => FieldMeta[];
  subscribe: (listener: () => void) => () => void;
}

export interface FormContextValue {
  store: FormInstance<object>;
  size: ControlSize;
  onValuesChange?: (changed: FormValues, all: FormValues) => void;
}

// Props the form item passes to the control it wraps
export interface ControlProps {
  value?: unknown;
  checked?: unknown;
  fileList?: unknown;
  onChange?: (...args: unknown[]) => void;
  children?: ReactNode;
}

export type ValidateStatus = "" | "success" | "error" | "validating";

export interface FormItemProps {
  name?: NamePath;
  rules?: readonly (Rule | RuleFactory)[];
  children: ReactElement;
  valuePropName?: "value" | "checked" | "fileList";
  getValueFromEvent?: (...args: never[]) => unknown;
  help?: ReactNode;
  validateStatus?: ValidateStatus;
  hasFeedback?: boolean;
  noStyle?: boolean;
  className?: string;
  dependencies?: NamePath[];
  label?: ReactNode;
  initialValue?: unknown;
}

export type FormProps<T extends object> = Omit<
  FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
> & {
  form?: FormInstance<T>;
  initialValues?: Partial<T>;
  onFinish?: (values: T) => void;
  onValuesChange?: (changed: Partial<T>, all: T) => void;
  size?: ControlSize;
  scrollToFirstError?: boolean;
  layout?: string;
  colon?: boolean;
};
