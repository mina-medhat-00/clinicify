import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, CircleAlert, Loader2 } from "lucide-react";
import { cx } from "@/components/ui/cx";

type NamePath = string | (string | number)[];

function toPath(name: NamePath) {
  return Array.isArray(name) ? name : [name];
}

function getValue(source: any, name?: NamePath) {
  if (name == null) return undefined;
  return toPath(name).reduce(function (object, key) {
    return object?.[key];
  }, source);
}

function setValue(source: any, name: NamePath, value: any) {
  const path = toPath(name);
  const root = Array.isArray(source) ? [...source] : { ...(source || {}) };
  let cursor: any = root;
  path.forEach(function (key, index) {
    if (index === path.length - 1) {
      cursor[key] = value;
      return;
    }
    const next = cursor[key];
    cursor[key] = Array.isArray(next) ? [...next] : { ...(next || {}) };
    cursor = cursor[key];
  });
  return root;
}

function changedObject(name: NamePath, value: any) {
  const path = toPath(name);
  let result: any = value;
  for (let index = path.length - 1; index >= 0; index -= 1) {
    result = { [path[index]]: result };
  }
  return result;
}

function isEmpty(value: any) {
  return (
    value == null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function emailOk(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function runRules(rules: any[] = [], value: any, getFieldValue: any) {
  for (const ruleOrFn of rules) {
    const rule =
      typeof ruleOrFn === "function" ? ruleOrFn({ getFieldValue }) : ruleOrFn;
    if (!rule) continue;
    if (rule.required && isEmpty(value)) {
      throw new Error(rule.message || "This field is required");
    }
    if (rule.pattern && value && !rule.pattern.test(value)) {
      throw new Error(rule.message || "Invalid value");
    }
    if (rule.type === "email" && value && !emailOk(value)) {
      throw new Error(rule.message || "Invalid email");
    }
    if (rule.validator) {
      await rule.validator(rule, value);
    }
  }
}

function cloneDeep(value: any): any {
  if (value == null || typeof value !== "object") return value;
  if (typeof value.format === "function" && typeof value.year === "function") {
    return value;
  }
  if (typeof File !== "undefined" && value instanceof File) return value;
  if (Array.isArray(value)) {
    return value.map(function (item) {
      return cloneDeep(item);
    });
  }
  const next: any = {};
  Object.keys(value).forEach(function (key) {
    next[key] = cloneDeep(value[key]);
  });
  return next;
}

function createFormStore(initial = {}) {
  let values: any = cloneDeep(initial);
  let initialValues: any = cloneDeep(initial);
  const fields = new Map<string, any>();
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
    getFieldValue: function (name: NamePath) {
      return getValue(values, name);
    },
    setFieldsValue: function (next: any) {
      values = { ...values, ...next };
      emit();
    },
    resetFields: function () {
      values = cloneDeep(initialValues);
      emit();
    },
    setInitial: function (next: any) {
      initialValues = cloneDeep(next || {});
      values = { ...cloneDeep(initialValues), ...values };
    },
    setValue: function (name: NamePath, value: any) {
      values = setValue(values, name, value);
      emit();
    },
    register: function (key: string, meta: any) {
      fields.set(key, meta);
      return function () {
        fields.delete(key);
      };
    },
    getFields: function () {
      return [...fields.values()];
    },
    subscribe: function (listener: () => void) {
      listeners.add(listener);
      return function () {
        listeners.delete(listener);
      };
    },
  };
}

function useForm() {
  const storeRef = useRef<any>(null);
  if (!storeRef.current) storeRef.current = createFormStore();
  return [storeRef.current];
}

const FormContext = createContext<any>(null);

export { FormContext };

function pathKey(name?: NamePath) {
  return name == null ? "" : toPath(name).join(".");
}

function defaultFromEvent(event: any) {
  if (event && typeof event === "object" && event.target) {
    const target = event.target;
    if (target.type === "checkbox") return target.checked;
    return target.value;
  }
  return event;
}

function injectControl(node: any, control: any): any {
  if (!isValidElement(node)) return node;
  const type: any = node.type;
  const name = type?.displayName || type?.name;
  if (name === "FormItem" || name === "Item") return node;
  const controlNames = [
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
  ];
  if (controlNames.includes(name)) {
    return cloneElement(node, {
      ...control,
      ...(node.props as any),
      value:
        (node.props as any).value !== undefined
          ? (node.props as any).value
          : control.value,
      checked:
        (node.props as any).checked !== undefined
          ? (node.props as any).checked
          : control.checked,
      onChange: function (...args: any[]) {
        control.onChange?.(...args);
        (node.props as any).onChange?.(...args);
      },
    });
  }
  const children = (node.props as any)?.children;
  if (children) {
    return cloneElement(node, {
      children: Children.map(children, function (child) {
        return injectControl(child, control);
      }),
    } as any);
  }
  return node;
}

function Item({
  name,
  rules = [],
  children,
  valuePropName = "value",
  getValueFromEvent,
  help,
  validateStatus,
  hasFeedback,
  noStyle,
  className,
  dependencies,
}: any) {
  const form = useContext(FormContext);
  const key = pathKey(name);
  const [, bump] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback(
    async function () {
      if (!name) return;
      try {
        await runRules(rules, form.store.getFieldValue(name), function (field) {
          return form.store.getFieldValue(field);
        });
        setError(null);
      } catch (err: any) {
        const message = err?.message || String(err);
        setError(message);
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
      const unsubField = form.store.register(key, { name, rules, validate });
      return function () {
        unsubStore();
        unsubField();
      };
    },
    [form, key, name, rules, validate],
  );

  useEffect(
    function () {
      if (!form || !dependencies?.length) return;
      let prev = dependencies.map(function (dep: NamePath) {
        return form.store.getFieldValue(dep);
      });
      return form.store.subscribe(function () {
        const next = dependencies.map(function (dep: NamePath) {
          return form.store.getFieldValue(dep);
        });
        const changed = next.some(function (value: any, index: number) {
          return value !== prev[index];
        });
        prev = next;
        if (changed && form.store.getFieldValue(name) != null) {
          validate().catch(function () {});
        }
      });
    },
    [dependencies, form, name, validate],
  );

  if (!form) return <div className={className}>{children}</div>;

  const value = name ? form.store.getFieldValue(name) : undefined;
  const control: any = {
    onChange: function (event: any) {
      if (!name) return;
      const next = (getValueFromEvent || defaultFromEvent)(event);
      form.store.setValue(name, next);
      form.onValuesChange?.(
        changedObject(name, next),
        form.store.getFieldsValue(),
      );
      validate().catch(function () {});
    },
  };
  if (valuePropName === "checked") control.checked = Boolean(value);
  else if (valuePropName === "fileList") control.fileList = value || [];
  else control.value = value;

  const child = injectControl(Children.only(children), control);
  const status = validateStatus || (error ? "error" : "");
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

function Form({
  form,
  initialValues = {},
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
}: any) {
  const [inner] = useForm();
  const store = form || inner;
  const didInit = useRef(false);
  if (!didInit.current) {
    store.setInitial(initialValues);
    didInit.current = true;
  }

  const ctx = useMemo(
    function () {
      return { store, size, onValuesChange };
    },
    [store, size, onValuesChange],
  );

  async function handleSubmit(event: any) {
    event.preventDefault();
    const fields = store.getFields();
    let firstError: HTMLElement | null = null;
    for (const field of fields) {
      try {
        await field.validate();
      } catch {
        if (!firstError) {
          firstError = event.currentTarget.querySelector(".text-red-500");
        }
      }
    }
    const stillErrors = [];
    for (const field of fields) {
      try {
        await field.validate();
      } catch (err) {
        stillErrors.push(err);
      }
    }
    if (stillErrors.length) {
      if (scrollToFirstError) {
        firstError?.scrollIntoView?.({ behavior: "smooth", block: "center" });
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
        onSubmit={handleSubmit}
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
