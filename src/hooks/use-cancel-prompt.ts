import { useState } from "react";
import type { CancelPrompt, SlotRef } from "@/types/appointment";
// Booked slot the cancel popup asks about kept briefly so the text stays while it slides away
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
