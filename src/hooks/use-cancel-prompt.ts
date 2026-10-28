import { useState } from "react";
import type { SlotRef } from "@/components/schedule/appointment-card";

export interface CancelPrompt {
  show: boolean;
  slot: SlotRef | null;
}

// Which booked slot the "cancel it?" popup asks about. The slot is kept a
// moment after closing so the text stays while the popup slides away.
export function useCancelPrompt() {
  const [prompt, setPrompt] = useState<CancelPrompt>({
    show: false,
    slot: null,
  });
  function open(slot: SlotRef) {
    setPrompt({ show: true, slot });
  }
  function close() {
    setPrompt(function (current) {
      return { ...current, show: false };
    });
    setTimeout(function () {
      setPrompt({ show: false, slot: null });
    }, 400);
  }
  return { prompt, open, close };
}
