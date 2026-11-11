import { useEffect } from "react";

// Calls onClose when Escape is pressed while active
export function useEscape(active: boolean, onClose?: () => void) {
  useEffect(
    function () {
      if (!active || !onClose) return;
      const close = onClose;
      function onKey(event: KeyboardEvent) {
        if (event.key === "Escape") close();
      }
      document.addEventListener("keydown", onKey);
      return function () {
        document.removeEventListener("keydown", onKey);
      };
    },
    [active, onClose],
  );
}
