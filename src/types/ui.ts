import type {
  ButtonHTMLAttributes,
  ReactNode,
  InputHTMLAttributes,
  KeyboardEvent,
  TextareaHTMLAttributes,
  HTMLAttributes,
  ChangeEvent,
  MouseEvent,
  CSSProperties,
  Key,
} from "react";
import type { ControlSize } from "@/types/form";

export type SelectOptions = (SelectOption<string> & { label: string })[];

export type ClassValue = string | false | null | undefined | 0 | ClassValue[];

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

export type TextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value"
> & {
  value?: string | null;
  // Show used / maxLength under the box
  showCount?: boolean;
};

export type InputNumberProps = Omit<
  InputProps,
  "value" | "onChange" | "type"
> & {
  value?: number | null;
  onChange?: (value: number | null) => void;
};

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

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> & {
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export type RadioValue = string | number;

export interface RadioGroupContext {
  value?: RadioValue | null;
  name: string;
  onChange: (value: RadioValue) => void;
}

export interface RadioProps {
  value: RadioValue;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (value: RadioValue) => void;
}

export type RadioGroupProps<V extends RadioValue> = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  value?: V | null;
  onChange?: (value: V) => void;
  name?: string;
};

export interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  checkedChildren?: ReactNode;
  unCheckedChildren?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export type AvatarSize = "small" | "default" | "large";

export type TagColor = "blue" | "red" | "gold" | "green" | "cyan";

export interface AlertProps {
  description?: ReactNode;
  closable?: { closeIcon?: ReactNode; onClose?: () => void };
  className?: string;
  type?: "error" | "warning" | "success" | "info";
}

export type SkeletonSize = number | "default" | "large";

export type TitleProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: 1 | 2 | 3 | 4 | 5;
  editable?: {
    text?: string;
    icon?: ReactNode;
    onChange?: (value: string) => void;
  };
};

export type RowProps = HTMLAttributes<HTMLDivElement> & {
  justify?: "start" | "center" | "end" | "space-between";
  align?: "top" | "middle" | "bottom";
  gutter?: number | [number, number];
};

export type SegmentedValue = string | number;

export type SegmentedOption<V extends SegmentedValue> =
  V | { label: ReactNode; value: V };

export interface FlipPalette {
  // Background of the upper and lower halves
  top: string;
  bottom: string;
  // Width of one digit card
  width: string;
  // Shorter flip for values changed by hand
  fast?: boolean;
}

export interface MenuClickInfo {
  key: string;
  keyPath: string[];
  domEvent: MouseEvent | KeyboardEvent;
}

export interface MenuItemType {
  key: string;
  label?: ReactNode;
  icon?: ReactNode;
  children?: MenuItemType[];
  onClick?: (info: MenuClickInfo) => void;
}

export type MenuTheme = "light" | "dark";

export interface MenuRef {
  menu: { readonly list: HTMLUListElement | null };
}

export interface MenuProps {
  items?: (MenuItemType | null | false | undefined)[];
  theme?: MenuTheme;
  mode?: "vertical" | "inline" | "horizontal";
  className?: string;
  onClick?: (info: MenuClickInfo) => void;
  style?: CSSProperties;
}

export type MessageType = "loading" | "success" | "error" | "warning" | "info";

export type ToastKey = string | number;

export interface Toast {
  id: ToastKey;
  type: MessageType;
  content?: ReactNode;
}

export interface MessageConfig {
  key?: ToastKey;
  type?: MessageType;
  content?: ReactNode;
  duration?: number;
}

export type Placement =
  "top" | "topLeft" | "bottom" | "bottomLeft" | "right" | "left";

export type FilterValue = string | number | boolean;

export interface FilterDropdownProps {
  selectedKeys: FilterValue[];
  setSelectedKeys: (keys: FilterValue[]) => void;
  confirm: () => void;
  clearFilters: () => void;
  close: () => void;
}

export interface ColumnBase<R> {
  title?: ReactNode;
  key?: string;
  filters?: { text: ReactNode; value: FilterValue }[];
  onFilter?: (value: FilterValue, record: R) => boolean;
  filterDropdown?: (props: FilterDropdownProps) => ReactNode;
  filterIcon?: (filtered: boolean) => ReactNode;
  filterDropdownProps?: { onOpenChange?: (open: boolean) => void };
}

// Column showing one row field by dataIndex or the whole row
export type FieldColumn<R> = {
  [K in keyof R & string]: ColumnBase<R> & {
    dataIndex: K;
    render?: (value: R[K], record: R, index: number) => ReactNode;
  };
}[keyof R & string];

export type RowColumn<R> = ColumnBase<R> & {
  dataIndex?: undefined;
  key: string;
  render: (record: R, _: R, index: number) => ReactNode;
};

export type TableColumn<R> = FieldColumn<R> | RowColumn<R>;

export interface TableRow {
  key?: Key;
}

export interface TableProps<R extends TableRow> {
  columns?: (TableColumn<R> | "EXPAND_COLUMN")[];
  dataSource?: R[] | null;
  pagination?: false | { pageSize?: number; position?: string[] };
  loading?: boolean;
  rowClassName?: string | ((record: R, index: number) => string);
  showHeader?: boolean;
  className?: string;
  expandable?: {
    expandedRowKeys?: (Key | null)[];
    expandedRowRender?: (record: R, index: number) => ReactNode;
    onExpand?: (expanded: boolean, record: R) => void;
  };
}

// true uploads and false keeps without uploading while LIST_IGNORE drops the file
export type BeforeUploadResult = boolean | "LIST_IGNORE";

export interface UploadFile {
  uid: string;
  name: string;
  status?: "done";
  originFileObj: File;
}

export interface UploadChange {
  file: UploadFile;
  fileList: UploadFile[];
}

export interface UploadProps {
  children?: ReactNode;
  beforeUpload?: (
    file: File,
  ) => BeforeUploadResult | Promise<BeforeUploadResult>;
  customRequest?: (options: {
    file: File;
    onSuccess: () => void;
    onError: () => void;
  }) => void;
  showUploadList?: boolean;
  onChange?: (change: UploadChange) => void;
  accept?: string;
  multiple?: boolean;
  maxCount?: number;
  listType?: "text" | "picture";
  name?: string;
  fileList?: UploadFile[];
  className?: string;
  dragger?: boolean;
}
