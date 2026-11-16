"use client";

import { useEffect, useState } from "react";

// The app runs with cacheComponents, which forbids reading the clock during
// render. The year is resolved after hydration and the initial pass renders
// an empty string so server and client markup always agree.
export default function CopyrightYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return <>{year ?? ""}</>;
}
