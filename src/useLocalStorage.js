import { useState, useEffect } from "react";

export function useLocalStorage(initialValue, key) {
  const [value, setValue] = useState(function () {
    const localWatched = localStorage.getItem(key);
    const res = localWatched ? JSON.parse(localWatched) : initialValue;
    return res;
  });

  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(value));
    },
    [value, key]
  );

  return [value, setValue];
}
