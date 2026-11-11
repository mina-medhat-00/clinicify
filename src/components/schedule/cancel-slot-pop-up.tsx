import PopUp from "@/components/ui/pop-up";
import { useUtilsContext } from "@/contexts/utils-context";
import { slotClock } from "@/utils/time";
import type { CancelPrompt, SlotRef } from "@/types/appointment";

export default function CancelSlotPopUp({
  prompt,
  onClose,
  onConfirm,
  closeColor,
  date,
}: {
  prompt: CancelPrompt;
  onClose: () => void;
  onConfirm: (slot: SlotRef) => void;
  closeColor?: string;
  // Slot day used to show the time on the viewer's clock
  date: string;
}) {
  const { slot } = prompt;
  const { timeZone } = useUtilsContext();
  const shownTime = slot ? slotClock(date, slot.slotTime, timeZone) : "";
  return (
    <PopUp show={prompt.show} handleClose={onClose} closeColor={closeColor}>
      <div className="rounded-lg bg-blue-700 p-2 text-center text-sm font-medium text-white sm:text-lg">
        {`The ${shownTime} slot is already booked`}
        <br /> Are you sure you want to cancel it?
      </div>
      <div className="flex justify-center gap-2 p-2 mt-4">
        <button
          type="button"
          onClick={function () {
            if (slot) onConfirm(slot);
          }}
          className="grow cursor-pointer rounded-lg bg-red-600 p-2 text-center font-medium text-white shadow-sm hover:bg-red-700"
        >
          Cancel appointment
        </button>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-lg bg-gray-200 p-2 text-center font-medium text-gray-800 shadow-sm hover:bg-gray-300"
        >
          Keep it
        </button>
      </div>
    </PopUp>
  );
}
