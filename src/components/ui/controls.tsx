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
} from "react";
import { cx, hasWidthClass } from "@/components/ui/cx";
import { FormContext } from "@/components/ui/form";

const sizePad = {
  small: "h-7 px-2 text-xs",
  middle: "h-8 px-3 text-sm",
  large: "h-10 px-3 text-base",
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
}: any) {
  const form = useContext(FormContext);
  const resolvedSize = size || form?.size || "middle";
  const isPrimary = type === "primary";
  const isLink = type === "link";
  return (
    <button
      type={htmlType}
      disabled={disabled || loading}
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-1.5 rounded-md border border-transparent font-medium transition",
        sizePad[resolvedSize] || sizePad.middle,
        shape === "circle" && "rounded-full p-0",
        isLink &&
          "h-auto border-0 bg-transparent px-1 text-blue-500 shadow-none hover:text-blue-600",
        isPrimary &&
          "border-blue-500 bg-blue-500 text-white hover:bg-blue-600 disabled:border-blue-300 disabled:bg-blue-300",
        !isPrimary &&
          !isLink &&
          "border-gray-300 bg-white text-black/85 hover:border-blue-400 hover:text-blue-500",
        (disabled || loading) && "cursor-not-allowed opacity-60",
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

const Input = forwardRef(function Input(
  {
    prefix,
    suffix,
    className,
    size,
    onPressEnter,
    onKeyDown,
    disabled,
    ...props
  }: any,
  ref: any,
) {
  const form = useContext(FormContext);
  const resolvedSize = size || form?.size || "middle";
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
        onKeyDown={function (event?: any) {
          onKeyDown?.(event);
          if (event.key === "Enter") onPressEnter?.(event);
        }}
        {...props}
        value={props.value ?? ""}
      />
      {suffix ? <span className="shrink-0 text-gray-400">{suffix}</span> : null}
    </span>
  );
});
Input.displayName = "Input";

function Password({ prefix, className, size, ...props }: any) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      size={size}
      prefix={prefix}
      className={className}
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

function TextArea({ className, rows = 3, ...props }: any) {
  return (
    <textarea
      rows={rows}
      className={cx(
        "rounded-md border border-gray-300 bg-white px-3 py-2 text-black/85 outline-none placeholder:text-gray-400 focus:border-blue-500",
        !hasWidthClass(className) && "w-full",
        className,
      )}
      {...props}
      value={props.value ?? ""}
    />
  );
}
TextArea.displayName = "TextArea";

const InputComponent: any = Input;
InputComponent.Password = Password;
InputComponent.TextArea = TextArea;

function InputNumber({
  className,
  min,
  max,
  value,
  onChange,
  placeholder,
  disabled,
  ...props
}: any) {
  return (
    <Input
      type="number"
      className={className}
      min={min}
      max={max}
      disabled={disabled}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={function (event?: any) {
        const next = event.target.value;
        onChange?.(next === "" ? null : Number(next));
      }}
      {...props}
    />
  );
}
InputNumber.displayName = "InputNumber";

function Select({
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
}: any) {
  const form = useContext(FormContext);
  const resolvedSize = size || form?.size || "middle";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find(function (option: any) {
    return option.value === value;
  });
  const filtered = useMemo(
    function () {
      if (!showSearch || !query) return options;
      const needle = query.toLowerCase();
      return options.filter(function (option: any) {
        return String(option[optionFilterProp] ?? option.label ?? option.value)
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
          {filtered.map(function (option: any) {
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

function Checkbox({
  checked,
  defaultChecked,
  onChange,
  children,
  className,
  disabled,
  ...props
}: any) {
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
        checked={Boolean(isChecked)}
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

const RadioContext = createContext<any>(null);

function Radio({ value, children, className, disabled, ...props }: any) {
  const group = useContext(RadioContext);
  const checked = group ? group.value === value : props.checked;
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
        checked={Boolean(checked)}
        disabled={disabled}
        name={group?.name}
        onChange={function () {
          group?.onChange?.(value);
          props.onChange?.(value);
        }}
      />
      {children}
    </label>
  );
}
Radio.displayName = "Radio";

function RadioButton({ value, children, className, disabled }: any) {
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
        group?.onChange?.(value);
      }}
    >
      {children}
    </button>
  );
}
RadioButton.displayName = "RadioButton";

function RadioGroup({
  value,
  onChange,
  children,
  className,
  name,
  ...props
}: any) {
  const autoName = useId();
  return (
    <RadioContext.Provider
      value={{
        value,
        name: name || autoName,
        onChange: function (next: any) {
          onChange?.(next);
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

function Switch({
  checked,
  onChange,
  checkedChildren,
  unCheckedChildren,
  className,
  disabled,
}: any) {
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

function Space({ children, className, ...props }: any) {
  return (
    <div
      className={cx("flex flex-wrap items-center gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function Compact({ children, className, block, ...props }: any) {
  const nodes = Children.toArray(children).filter(Boolean);
  return (
    <div className={cx("flex", block && "w-full", className)} {...props}>
      {nodes.map(function (child: any, index) {
        if (!isValidElement(child)) return child;
        return cloneElement(child, {
          className: cx(
            (child.props as any).className,
            "rounded-none",
            index === 0 && "rounded-l-md",
            index === nodes.length - 1 && "rounded-r-md",
          ),
        } as any);
      })}
    </div>
  );
}

Space.Compact = Compact;

export {
  Button,
  Checkbox,
  InputComponent as Input,
  InputNumber,
  Radio,
  Select,
  Space,
  Switch,
};
export type SelectProps = {
  options?: { value: any; label?: any }[];
};
