import { Check, ChevronDown, Eye, EyeOff, Loader2, Search } from "lucide-react";
import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cx, hasWidthClass } from "@/utils/cx";
import { FormContext, type ControlSize } from "@/components/ui/form";

const sizePad: Record<ControlSize, string> = {
  small: "h-7 px-2 text-xs",
  middle: "h-8 px-3 text-sm",
  large: "h-10 px-3 text-base",
};

function useControlSize(size?: ControlSize) {
  const form = useContext(FormContext);
  return size ?? form?.size ?? "middle";
}

export type ButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> & {
  type?: "default" | "primary" | "link";
  htmlType?: "button" | "submit" | "reset";
  icon?: ReactNode;
  loading?: boolean;
  shape?: "circle";
  size?: ControlSize;
};

function Button({
  type = "default",
  htmlType = "button",
  icon,
  loading,
  disabled,
  shape,
  size,
  className,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const resolvedSize = useControlSize(size);
  const isPrimary = type === "primary";
  const isLink = type === "link";
  const inactive = disabled === true || loading === true;
  return (
    <button
      type={htmlType}
      disabled={inactive}
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent font-medium transition",
        sizePad[resolvedSize],
        shape === "circle" && "rounded-full p-0",
        isLink &&
          "h-auto border-0 bg-transparent px-1 text-blue-500 shadow-none hover:text-blue-600",
        isPrimary &&
          "border-blue-500 bg-blue-500 text-white hover:bg-blue-600 disabled:border-blue-300 disabled:bg-blue-300",
        !isPrimary &&
          !isLink &&
          "border-gray-300 bg-white text-black/85 hover:border-blue-400 hover:text-blue-500",
        inactive && "cursor-not-allowed opacity-60",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

const inputShell =
  "flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-black/85 transition focus-within:border-blue-500";
const inputField =
  "min-w-0 flex-1 bg-transparent py-1.5 outline-none placeholder:text-gray-400";

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "prefix" | "value"
> & {
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: ControlSize;
  value?: string | number | null;
  onPressEnter?: (event: KeyboardEvent<HTMLInputElement>) => void;
};

const BaseInput = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    prefix,
    suffix,
    className,
    size,
    onPressEnter,
    onKeyDown,
    disabled,
    value,
    ...props
  },
  ref,
) {
  const resolvedSize = useControlSize(size);
  return (
    <span
      className={cx(
        inputShell,
        resolvedSize === "large" && "min-h-10",
        resolvedSize === "small" && "min-h-7 text-xs",
        !hasWidthClass(className) && "w-full",
        disabled && "cursor-not-allowed bg-gray-100 opacity-70",
        className,
      )}
    >
      {prefix ? <span className="shrink-0 text-gray-400">{prefix}</span> : null}
      <input
        ref={ref}
        disabled={disabled}
        className={inputField}
        onKeyDown={function (event) {
          onKeyDown?.(event);
          if (event.key === "Enter") onPressEnter?.(event);
        }}
        {...props}
        value={value ?? ""}
      />
      {suffix ? <span className="shrink-0 text-gray-400">{suffix}</span> : null}
    </span>
  );
});
BaseInput.displayName = "Input";

function Password(props: Omit<InputProps, "type" | "suffix">) {
  const [visible, setVisible] = useState(false);
  return (
    <BaseInput
      {...props}
      type={visible ? "text" : "password"}
      suffix={
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600"
          onClick={function () {
            setVisible(function (value) {
              return !value;
            });
          }}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
}
Password.displayName = "Password";

type TextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value"
> & {
  value?: string | null;
  // Show "used / maxLength" under the box.
  showCount?: boolean;
};

function TextArea({
  className,
  rows = 3,
  value,
  showCount,
  maxLength,
  ...props
}: TextAreaProps) {
  const text = value ?? "";
  const box = (
    <textarea
      rows={rows}
      maxLength={maxLength}
      className={cx(
        "rounded-md border border-gray-300 bg-white px-3 py-2 text-black/85 outline-none placeholder:text-gray-400 focus:border-blue-500",
        !hasWidthClass(className) && "w-full",
        className,
      )}
      {...props}
      value={text}
    />
  );
  if (!showCount) return box;
  return (
    <div>
      {box}
      <div className="text-right text-xs text-gray-400">
        {maxLength === undefined
          ? text.length
          : `${String(text.length)} / ${String(maxLength)}`}
      </div>
    </div>
  );
}
TextArea.displayName = "TextArea";

const Input = Object.assign(BaseInput, { Password, TextArea });

type InputNumberProps = Omit<InputProps, "value" | "onChange" | "type"> & {
  value?: number | null;
  onChange?: (value: number | null) => void;
};

function InputNumber({ value, onChange, ...props }: InputNumberProps) {
  return (
    <BaseInput
      type="number"
      value={value ?? ""}
      onChange={function (event) {
        const next = event.target.value;
        onChange?.(next === "" ? null : Number(next));
      }}
      {...props}
    />
  );
}
InputNumber.displayName = "InputNumber";

export type SelectValue = string | number;
export interface SelectOption<V extends SelectValue = SelectValue> {
  value: V;
  label?: ReactNode;
}
export type SelectProps<V extends SelectValue = SelectValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  options?: SelectOption<V>[];
  value?: V | null;
  onChange?: (value: V, option: SelectOption<V>) => void;
  showSearch?: boolean;
  optionFilterProp?: "value" | "label";
  placeholder?: ReactNode;
  disabled?: boolean;
  size?: ControlSize;
};

function Select<V extends SelectValue = SelectValue>({
  options = [],
  value,
  onChange,
  showSearch,
  optionFilterProp = "value",
  placeholder,
  className,
  disabled,
  size,
  ...props
}: SelectProps<V>) {
  const resolvedSize = useControlSize(size);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find(function (option) {
    return option.value === value;
  });
  const filtered = useMemo(
    function () {
      if (!showSearch || !query) return options;
      const needle = query.toLowerCase();
      return options.filter(function (option) {
        const field = option[optionFilterProp] ?? option.label ?? option.value;
        return (
          typeof field === "string" || typeof field === "number"
            ? String(field)
            : ""
        )
          .toLowerCase()
          .includes(needle);
      });
    },
    [options, query, showSearch, optionFilterProp],
  );

  useEffect(function () {
    function onDoc(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    return function () {
      document.removeEventListener("mousedown", onDoc);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cx(
        "relative",
        !hasWidthClass(className) && "w-full",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={function () {
          if (!disabled)
            setOpen(function (next) {
              return !next;
            });
        }}
        className={cx(
          inputShell,
          "w-full justify-between text-left",
          resolvedSize === "large" && "min-h-10",
          resolvedSize === "small" && "min-h-7 text-xs",
          disabled && "cursor-not-allowed bg-gray-100 opacity-70",
        )}
      >
        <span className={cx(!selected && "text-gray-400")}>
          {selected?.label ?? placeholder ?? "Select"}
        </span>
        <ChevronDown className="size-4 shrink-0 text-gray-400" />
      </button>
      {open ? (
        <div className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {showSearch ? (
            <div className="flex items-center gap-2 border-b border-gray-100 px-2 py-1">
              <Search className="size-3.5 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={function (event) {
                  setQuery(event.target.value);
                }}
                className="w-full bg-transparent py-1 text-sm outline-none"
                placeholder="Search"
              />
            </div>
          ) : null}
          {filtered.map(function (option) {
            const active = option.value === value;
            return (
              <button
                type="button"
                key={String(option.value)}
                className={cx(
                  "flex w-full items-center justify-between px-3 py-1.5 text-left text-sm hover:bg-blue-50",
                  active && "bg-blue-50 text-blue-600",
                )}
                onClick={function () {
                  onChange?.(option.value, option);
                  setOpen(false);
                  setQuery("");
                }}
              >
                {option.label ?? option.value}
                {active ? <Check className="size-3.5" /> : null}
              </button>
            );
          })}
          {!filtered.length ? (
            <div className="px-3 py-2 text-sm text-gray-400">No data</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
Select.displayName = "Select";

type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> & {
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

function Checkbox({
  checked,
  defaultChecked,
  onChange,
  children,
  className,
  disabled,
  ...props
}: CheckboxProps) {
  const [uncontrolled, setUncontrolled] = useState(Boolean(defaultChecked));
  const isChecked = checked ?? uncontrolled;
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer items-center gap-2",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input
        type="checkbox"
        className="size-4 accent-blue-500"
        checked={isChecked}
        disabled={disabled}
        onChange={function (event) {
          setUncontrolled(event.target.checked);
          onChange?.(event);
        }}
        {...props}
      />
      {children}
    </label>
  );
}
Checkbox.displayName = "Checkbox";

type RadioValue = string | number;
interface RadioGroupContext {
  value?: RadioValue | null;
  name: string;
  onChange: (value: RadioValue) => void;
}

const RadioContext = createContext<RadioGroupContext | null>(null);

interface RadioProps {
  value: RadioValue;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (value: RadioValue) => void;
}

function Radio({
  value,
  children,
  className,
  disabled,
  checked,
  onChange,
}: RadioProps) {
  const group = useContext(RadioContext);
  const isChecked = group ? group.value === value : checked;
  return (
    <label
      className={cx(
        "inline-flex cursor-pointer items-center gap-2",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <input
        type="radio"
        className="size-4 accent-blue-500"
        value={value}
        checked={Boolean(isChecked)}
        disabled={disabled}
        name={group?.name}
        onChange={function () {
          group?.onChange(value);
          onChange?.(value);
        }}
      />
      {children}
    </label>
  );
}
Radio.displayName = "Radio";

function RadioButton({
  value,
  children,
  className,
  disabled,
}: Omit<RadioProps, "checked" | "onChange">) {
  const group = useContext(RadioContext);
  const checked = group?.value === value;
  return (
    <button
      type="button"
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center rounded-md border px-4 py-2 font-medium",
        checked
          ? "border-blue-500 bg-blue-500 text-white"
          : "border-gray-300 bg-white",
        className,
      )}
      onClick={function () {
        group?.onChange(value);
      }}
    >
      {children}
    </button>
  );
}
RadioButton.displayName = "RadioButton";

type RadioGroupProps<V extends RadioValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  value?: V | null;
  onChange?: (value: V) => void;
  name?: string;
};

function RadioGroup<V extends RadioValue>({
  value,
  onChange,
  children,
  className,
  name,
  ...props
}: RadioGroupProps<V>) {
  const autoName = useId();
  return (
    <RadioContext.Provider
      value={{
        value,
        name: name ?? autoName,
        onChange: function (next) {
          onChange?.(next as V);
        },
      }}
    >
      <div className={cx("inline-flex flex-wrap gap-2", className)} {...props}>
        {children}
      </div>
    </RadioContext.Provider>
  );
}
RadioGroup.displayName = "RadioGroup";

Radio.Group = RadioGroup;
Radio.Button = RadioButton;

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  checkedChildren?: ReactNode;
  unCheckedChildren?: ReactNode;
  className?: string;
  disabled?: boolean;
}

function Switch({
  checked,
  onChange,
  checkedChildren,
  unCheckedChildren,
  className,
  disabled,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={Boolean(checked)}
      disabled={disabled}
      onClick={function () {
        onChange?.(!checked);
      }}
      className={cx(
        "relative inline-flex h-6 min-w-11 items-center rounded-full px-1 text-xs font-medium text-white transition",
        checked ? "bg-blue-500" : "bg-gray-400",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <span
        className={cx(
          "absolute size-4 rounded-full bg-white shadow transition",
          checked ? "right-1" : "left-1",
        )}
      />
      <span className={cx("px-4", checked ? "pr-1 pl-2" : "pl-1 pr-2")}>
        {checked ? checkedChildren : unCheckedChildren}
      </span>
    </button>
  );
}
Switch.displayName = "Switch";

function Space({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function Compact({
  children,
  className,
  block,
  ...props
}: HTMLAttributes<HTMLDivElement> & { block?: boolean }) {
  const nodes = Children.toArray(children);
  return (
    <div className={cx("flex", block && "w-full", className)} {...props}>
      {nodes.map(function (child, index) {
        if (!isValidElement<{ className?: string }>(child)) return child;
        return cloneElement(child, {
          className: cx(
            child.props.className,
            "rounded-none",
            index === 0 && "rounded-l-md",
            index === nodes.length - 1 && "rounded-r-md",
          ),
        });
      })}
    </div>
  );
}

Space.Compact = Compact;

export { Button, Checkbox, Input, InputNumber, Radio, Select, Space, Switch };
