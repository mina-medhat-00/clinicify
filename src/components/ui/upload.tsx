import { ImagePlus, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { cx } from "@/utils/cx";

const LIST_IGNORE = "LIST_IGNORE" as const;

// true: keep and upload; false: keep without uploading; LIST_IGNORE: drop.
export type BeforeUploadResult = boolean | typeof LIST_IGNORE;

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

function noop() {
  // Uploads finish instantly; there is nothing to report.
}

function toItem(file: File, status?: "done"): UploadFile {
  return {
    uid: `${file.name}-${String(file.size)}-${String(file.lastModified)}`,
    name: file.name,
    status,
    originFileObj: file,
  };
}

function UploadBase({
  children,
  beforeUpload,
  customRequest,
  showUploadList = true,
  onChange,
  accept,
  multiple,
  maxCount,
  listType,
  name,
  fileList,
  className,
  dragger,
}: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internal, setInternal] = useState<UploadFile[]>([]);
  const list = fileList ?? internal;

  async function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    let next = [...list];
    for (const file of incoming) {
      const allowed = beforeUpload ? await beforeUpload(file) : true;
      if (allowed === LIST_IGNORE || !allowed) {
        if (allowed === false) {
          const item = toItem(file);
          next = multiple ? [...next, item] : [item];
          const payload = { file: item, fileList: next };
          setInternal(next);
          onChange?.(payload);
        }
        continue;
      }
      const item = toItem(file, "done");
      next = multiple || (maxCount && maxCount > 1) ? [...next, item] : [item];
      if (maxCount) next = next.slice(-maxCount);
      customRequest?.({
        file,
        onSuccess: noop,
        onError: noop,
      });
      const payload = { file: item, fileList: next };
      setInternal(next);
      onChange?.(payload);
    }
  }

  function removeAt(index: number) {
    const removed = list[index];
    if (!removed) return;
    const next = list.filter(function (_, current) {
      return current !== index;
    });
    setInternal(next);
    onChange?.({ file: removed, fileList: next });
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={function (event) {
          if (event.target.files) void addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <div
        onClick={function () {
          inputRef.current?.click();
        }}
        onDragOver={function (event) {
          event.preventDefault();
        }}
        onDrop={function (event) {
          event.preventDefault();
          void addFiles(event.dataTransfer.files);
        }}
        className={cx(
          "cursor-pointer",
          dragger &&
            "rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center hover:border-blue-400",
        )}
      >
        {children}
      </div>
      {showUploadList && list.length ? (
        <div className="ant-upload-list mt-2 flex flex-wrap gap-2">
          {list.map(function (file, index) {
            return (
              <div
                key={file.uid}
                className="ant-upload-list-item flex max-w-full items-center gap-2 rounded bg-bg-bar px-2 py-1 text-white"
              >
                {listType === "picture" ? (
                  <img
                    src={URL.createObjectURL(file.originFileObj)}
                    alt=""
                    className="size-8 rounded object-cover"
                  />
                ) : (
                  <ImagePlus className="size-4" />
                )}
                <span className="ant-upload-list-item-name max-w-40 truncate">
                  {file.name}
                </span>
                <button
                  type="button"
                  className="ant-upload-list-item-action"
                  onClick={function (event) {
                    event.stopPropagation();
                    removeAt(index);
                  }}
                >
                  <X className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
UploadBase.displayName = "Upload";

function Dragger(props: Omit<UploadProps, "dragger">) {
  return <UploadBase {...props} dragger />;
}
Dragger.displayName = "UploadDragger";

const Upload = Object.assign(UploadBase, {
  LIST_IGNORE,
  Dragger,
});

export { Upload };
