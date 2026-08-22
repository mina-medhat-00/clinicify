import { ImagePlus, X } from "lucide-react";
import { useRef, useState } from "react";
import { cx } from "@/components/ui/cx";

const LIST_IGNORE = "LIST_IGNORE";

async function runBefore(beforeUpload: any, file: File) {
  if (!beforeUpload) return true;
  const result = beforeUpload(file);
  return result;
}

function toItem(file: File, status?: string) {
  return {
    uid: `${file.name}-${file.size}-${file.lastModified}`,
    name: file.name,
    status,
    originFileObj: file,
  };
}

function Upload({
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
}: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internal, setInternal] = useState<any[]>([]);
  const list = fileList || internal;

  async function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    let next = [...list];
    for (const file of incoming) {
      const allowed = await runBefore(beforeUpload, file);
      if (allowed === LIST_IGNORE || allowed === false) {
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
        onSuccess: function () {},
        onError: function () {},
      });
      const payload = { file: item, fileList: next };
      setInternal(next);
      onChange?.(payload);
    }
  }

  function removeAt(index: number) {
    const next = list.filter(function (_: any, current: number) {
      return current !== index;
    });
    setInternal(next);
    onChange?.({ file: list[index], fileList: next });
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
          if (event.target.files) addFiles(event.target.files);
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
          if (event.dataTransfer.files) addFiles(event.dataTransfer.files);
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
          {list.map(function (file: any, index: number) {
            return (
              <div
                key={file.uid || index}
                className="ant-upload-list-item flex max-w-full items-center gap-2 rounded bg-bg-bar px-2 py-1 text-white"
              >
                {listType === "picture" && file.originFileObj ? (
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
Upload.displayName = "Upload";
Upload.LIST_IGNORE = LIST_IGNORE;

function Dragger(props: any) {
  return <Upload {...props} dragger />;
}
Dragger.displayName = "UploadDragger";
Upload.Dragger = Dragger;

export { Upload };
