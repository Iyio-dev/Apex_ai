import { toast } from "../components/ui/ToastHost";
import { useEffect, useState } from "react";
import { api, errorText } from "../api";
export function useLoad(path) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    setError("");
    setLoading(true);
    api(path)
      .then((x) => alive && setData(x))
      .catch((e) => alive && (setError(errorText(e)), toast(errorText(e), "error", () => setTick(t => t + 1))))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [path, tick]);
  return { data, error, loading, refresh: () => setTick((t) => t + 1) };
}
