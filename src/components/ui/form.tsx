import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type SubmitEvent,
  type FormHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { Check, CircleAlert, Loader2 } from "lucide-react";
import { cx } from "@/utils/cx";

export type NamePath = string | (string | number)[];
export type FormValues = Record<string, unknown>;
export type ControlSize = "small" | "middle" | "large";

type Bag = Record<string | number, unknown>;

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

function toPath(name: NamePath) {
  return Array.isArray(name) ? name : [name];
}

function isBag(value: unknown): value is Bag {
  return typeof value === "object" && value !== null;
}

function getValue(source: unknown, name?: NamePath): unknown {
  if (name === undefined) return undefined;
  return toPath(name).reduce<unknown>(function (object, key) {
    return isBag(object) ? object[key] : undefined;
  }, source);
}

function copyOf(value: unknown): Bag {
  if (Array.isArray(value)) return [...(value as unknown[])] as unknown as Bag;
  return isBag(value) ? { ...value } : {};
}

function setValue<T>(source: T, name: NamePath, value: unknown): T {
  const path = toPath(name);
  const root = copyOf(source);
  let cursor = root;
  path.forEach(function (key, index) {
    if (index === path.length - 1) {
      cursor[key] = value;
      return;
    }
    const next = copyOf(cursor[key]);
    cursor[key] = next;
    cursor = next;
  });
  return root as T;
}

function changedObject(name: NamePath, value: unknown) {
  return toPath(name).reduceRight<unknown>(function (result, key) {
    return { [key]: result };
  }, value) as FormValues;
}

function isEmpty(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function emailOk(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function runRules(
  rules: readonly (Rule | RuleFactory)[],
  value: unknown,
  getFieldValue: (name: NamePath) => unknown,
) {
  const text = typeof value === "string" ? value : "";
  for (const ruleOrFn of rules) {
    const rule =
      typeof ruleOrFn === "function" ? ruleOrFn({ getFieldValue }) : ruleOrFn;
    if (rule.required && isEmpty(value)) {
      throw new Error(rule.message ?? "This field is required");
    }
    if (rule.pattern && text && !rule.pattern.test(text)) {
      throw new Error(rule.message ?? "Invalid value");
    }
    if (rule.type === "email" && text && !emailOk(text)) {
      throw new Error(rule.message ?? "Invalid email");
    }
    if (rule.validator) {
      try {
        await rule.validator(rule, value);
      } catch (err) {
        // A validator that fails without saying why shows the rule's message.
        const reason = err instanceof Error ? err.message : "";
        throw new Error(reason || (rule.message ?? "Invalid value"), {
          cause: err,
        });
      }
    }
  }
}

function isDayjs(value: Bag) {
  return typeof value.format === "function" && typeof value.year === "function";
}

function cloneDeep<T>(value: T): T {
  if (!isBag(value)) return value;
  if (isDayjs(value) || value instanceof File) return value;
  if (Array.isArray(value)) {
    return (value as unknown[]).map(function (item) {
      return cloneDeep(item);
    }) as T;
  }
  const next: Bag = {};
  Object.keys(value).forEach(function (key) {
    next[key] = cloneDeep(value[key]);
  });
  return next as T;
}

interface FieldMeta {
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

function createFormStore<T extends object>(): FormInstance<T> {
  let values = {} as T;
  let initialValues: Partial<T> = {};
  const fields = new Map<string, FieldMeta>();
  const listeners = new Set<() => void>();

  function emit() {
    listeners.forEach(function (listener) {
      listener();
    });
  }

  return {
    getFieldsValue: function () {
      return values;
    },
    getFieldValue: function (name) {
      return getValue(values, name);
    },
    setFieldsValue: function (next) {
      values = { ...values, ...next };
      emit();
    },
    resetFields: function () {
      values = cloneDeep(initialValues) as T;
      emit();
    },
    setInitial: function (next) {
      initialValues = cloneDeep(next);
      values = { ...cloneDeep(initialValues), ...values };
    },
    setValue: function (name, value) {
      values = setValue(values, name, value);
      emit();
    },
    register: function (key, meta) {
      fields.set(key, meta);
      return function () {
        fields.delete(key);
      };
    },
    getFields: function () {
      return [...fields.values()];
    },
    subscribe: function (listener) {
      listeners.add(listener);
      return function () {
        listeners.delete(listener);
      };
    },
  };
}

function useForm<T extends object = FormValues>(): [FormInstance<T>] {
  const [store] = useState(createFormStore<T>);
  return [store];
}

interface FormContextValue {
  store: FormInstance<object>;
  size: ControlSize;
  onValuesChange?: (changed: FormValues, all: FormValues) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export { FormContext };

function pathKey(name?: NamePath) {
  return name === undefined ? "" : toPath(name).join(".");
}

function defaultFromEvent(event: unknown) {
  if (isBag(event) && isBag(event.target)) {
    const target = event.target;
    if (target.type === "checkbox") return target.checked;
    return target.value;
  }
  return event;
}

// The props Form.Item hands to the control it wraps.
interface ControlProps {
  value?: unknown;
  checked?: unknown;
  fileList?: unknown;
  onChange?: (...args: unknown[]) => void;
  children?: ReactNode;
}

const controlNames = new Set([
  "Input",
  "Password",
  "TextArea",
  "Select",
  "DatePicker",
  "InputNumber",
  "Checkbox",
  "Switch",
  "RadioGroup",
  "Upload",
  "UploadDragger",
]);

function typeName(type: unknown) {
  if (typeof type !== "function" && !isBag(type)) return undefined;
  const component = type as { displayName?: string; name?: string };
  return component.displayName ?? component.name;
}

// Wires the first form control found in `node` to the form store.
function injectControl(node: ReactNode, control: ControlProps): ReactNode {
  if (!isValidElement<ControlProps>(node)) return node;
  const name = typeName(node.type);
  if (name === "FormItem" || name === "Item") return node;
  const props = node.props;
  if (name && controlNames.has(name)) {
    return cloneElement(node, {
      ...control,
      ...props,
      value: props.value !== undefined ? props.value : control.value,
      checked: props.checked !== undefined ? props.checked : control.checked,
      onChange: function (...args: unknown[]) {
        control.onChange?.(...args);
        props.onChange?.(...args);
      },
    });
  }
  if (props.children) {
    return cloneElement(node, {
      children: Children.map(props.children, function (child) {
        return injectControl(child, control);
      }),
    });
  }
  return node;
}

type ValidateStatus = "" | "success" | "error" | "validating";

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

const noRules: readonly Rule[] = [];

function Item({
  name,
  rules = noRules,
  children,
  valuePropName = "value",
  getValueFromEvent,
  help,
  validateStatus,
  hasFeedback,
  noStyle,
  className,
  dependencies,
}: FormItemProps) {
  const form = useContext(FormContext);
  const key = pathKey(name);
  const [, bump] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    async function () {
      if (!name || !form) return;
      try {
        await runRules(rules, form.store.getFieldValue(name), function (field) {
          return form.store.getFieldValue(field);
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        throw err;
      }
    },
    [form, name, rules],
  );

  useEffect(
    function () {
      if (!form || !name) return;
      const unsubStore = form.store.subscribe(function () {
        bump(function (n) {
          return n + 1;
        });
      });
      const unsubField = form.store.register(key, { name, validate });
      return function () {
        unsubStore();
        unsubField();
      };
    },
    [form, key, name, validate],
  );

  useEffect(
    function () {
      if (!form || !name || !dependencies?.length) return;
      let prev = dependencies.map(function (dep) {
        return form.store.getFieldValue(dep);
      });
      return form.store.subscribe(function () {
        const next = dependencies.map(function (dep) {
          return form.store.getFieldValue(dep);
        });
        const changed = next.some(function (value, index) {
          return value !== prev[index];
        });
        prev = next;
        if (changed && !isEmpty(form.store.getFieldValue(name))) {
          validate().catch(function () {
            // The error is already shown under the field.
          });
        }
      });
    },
    [dependencies, form, name, validate],
  );

  if (!form) return <div className={className}>{children}</div>;

  const value = name ? form.store.getFieldValue(name) : undefined;
  const fromEvent = (getValueFromEvent ?? defaultFromEvent) as (
    ...args: unknown[]
  ) => unknown;
  const control: ControlProps = {
    onChange: function (...args) {
      if (!name) return;
      const next = fromEvent(...args);
      form.store.setValue(name, next);
      form.onValuesChange?.(
        changedObject(name, next),
        form.store.getFieldsValue() as FormValues,
      );
      validate().catch(function () {
        // The error is already shown under the field.
      });
    },
  };
  if (valuePropName === "checked") control.checked = Boolean(value);
  else if (valuePropName === "fileList") control.fileList = value ?? [];
  else control.value = value;

  const child = injectControl(Children.only(children), control);
  const status = validateStatus ?? (error ? "error" : "");
  const message = help !== undefined ? help : error;

  if (noStyle) return child;

  return (
    <div className={cx("mb-4", className)}>
      <div className="relative">
        {child}
        {hasFeedback && status === "success" ? (
          <Check className="absolute top-3 right-3 size-4 text-green-500" />
        ) : null}
        {hasFeedback && status === "error" ? (
          <CircleAlert className="absolute top-3 right-3 size-4 text-red-500" />
        ) : null}
        {hasFeedback && status === "validating" ? (
          <Loader2 className="absolute top-3 right-3 size-4 animate-spin text-blue-500" />
        ) : null}
      </div>
      {message ? (
        <div
          className={cx(
            "mt-1 text-xs",
            status === "error" || error ? "text-red-500" : "text-gray-500",
          )}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
Item.displayName = "FormItem";

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

function Form<T extends object = FormValues>({
  form,
  initialValues,
  onFinish,
  onValuesChange,
  children,
  className,
  size = "middle",
  scrollToFirstError,
  layout,
  colon,
  name,
  autoComplete,
  ...props
}: FormProps<T>) {
  const [inner] = useForm<T>();
  const store = form ?? inner;
  useState(function () {
    store.setInitial(initialValues ?? {});
    return true;
  });

  const ctx = useMemo(
    function (): FormContextValue {
      return {
        store: store,
        size,
        onValuesChange: onValuesChange as FormContextValue["onValuesChange"],
      };
    },
    [store, size, onValuesChange],
  );

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const fields = store.getFields();
    let hasErrors = false;
    for (const field of fields) {
      try {
        await field.validate();
      } catch {
        hasErrors = true;
      }
    }
    if (hasErrors) {
      // Wait a frame so the error messages are on the page.
      if (scrollToFirstError) {
        requestAnimationFrame(function () {
          formElement
            .querySelector(".text-red-500")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
      return;
    }
    onFinish?.(store.getFieldsValue());
  }

  return (
    <FormContext.Provider value={ctx}>
      <form
        name={name}
        autoComplete={autoComplete}
        className={className}
        onSubmit={function (event) {
          void handleSubmit(event);
        }}
        data-layout={layout}
        data-colon={colon}
        data-size={size}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
}

Form.Item = Item;
Form.useForm = useForm;

export { Form, Item, useForm };
