import { useEffect, useState } from "react";

// True when something has been loading for longer than `ms`.
// Used to explain slow first loads on free hosting ("server is waking up").
export default function useSlowLoading(loading, ms = 6000) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    if (!loading) {
      setSlow(false);
      return;
    }
    const t = setTimeout(() => setSlow(true), ms);
    return () => clearTimeout(t);
  }, [loading, ms]);
  return slow;
}
