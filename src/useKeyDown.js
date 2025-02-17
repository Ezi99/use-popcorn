import { useEffect } from "react";

export function useKeyDown(key, action) {
  useEffect(
    function () {
      function callback(event) {
        if (event.code.toLowerCase() === key.toLowerCase()) {
          action();
        }
      }

      document.addEventListener("keydown", callback);

      return () => document.removeEventListener("keydown", callback);
    },
    [key, action]
  );
}
