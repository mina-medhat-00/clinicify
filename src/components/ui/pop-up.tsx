import { useEffect, useState } from "react";
import { X } from "lucide-react";

function PopUp({
  children,
  show,
  mt,
  handleClose,
  customWidth,
  closeColor,
  customStyle = {},
}: any) {
  const [showPop, setShowPop] = useState(false);
  useEffect(
    function () {
      let timeId;
      if (!show) {
        timeId = setTimeout(function () {
          setShowPop(show);
        }, 500);
      } else setShowPop(show);
      return function () {
        clearTimeout(timeId);
      };
    },
    [show],
  );
  useEffect(
    function () {
      if (!showPop) document.body.style.overflow = "";
      else document.body.style.overflow = "hidden";
      return function () {
        document.body.style.overflow = "";
      };
    },
    [showPop],
  );
  return (
    <>
      {(showPop ? showPop : show) && (
        <div className="mask--booked z-50 backdrop-blur-xl transition-all duration-500 fixed flex items-start justify-center top-0 left-0 h-full w-full">
          <div
            style={{
              marginTop: mt ? mt : "30vh",
              maxHeight: mt ? `calc(100vh - ${mt})` : "70vh",
              ...customStyle,
            }}
            className={`bg-white overflow-auto flex flex-col scroll--v scroll--h h-fit relative ${
              customWidth ? `${customWidth}` : "w-3/4 sm:w-1/2"
            } transition-all duration-500  ${
              showPop ? (!show ? "-left-full" : "left-0") : "-left-full"
            } p-4 rounded-lg shadow-lg`}
          >
            <X
              onClick={handleClose}
              className={`flex shrink-0 cursor-pointer ${
                closeColor ? closeColor : "text-gray-700 hover:text-gray-800"
              } justify-center ml-auto my-2 items-center size-9`}
            />
            {children}
          </div>
        </div>
      )}
    </>
  );
}

export default PopUp;
