import type { SlotRef } from "@/components/schedule/appointment-card";
import type { CancelPrompt } from "@/hooks/use-cancel-prompt";
import PopUp from "@/components/ui/pop-up";

export default function CancelSlotPopUp({
  prompt,
  onClose,
  onConfirm,
  closeColor,
}: {
  prompt: CancelPrompt;
  onClose: () => void;
  onConfirm: (slot: SlotRef) => void;
  closeColor?: string;
}) {
  const { slot } = prompt;
  return (
    <PopUp show={prompt.show} handleClose={onClose} closeColor={closeColor}>
      <div className="text-center text-sm sm:text-lg p-2 bg-blue-400 text-white font-medium rounded-lg">
        {`${slot?.slotTime ?? ""} already booked`}
        <br /> Are you sure that you want cancel it ?
      </div>
      <div className="flex justify-center gap-2 p-2 mt-4">
        <div
          onClick={function () {
            if (slot) onConfirm(slot);
          }}
          className="cursor-pointer text-center bg-red-500 p-2 grow text-white font-medium rounded-lg shadow-sm"
        >
          Apply
        </div>
        <div
          onClick={onClose}
          className="cursor-pointer text-center bg-blue-400 p-2 text-white font-medium rounded-lg shadow-sm"
        >
          Cancel
        </div>
      </div>
    </PopUp>
  );
}
