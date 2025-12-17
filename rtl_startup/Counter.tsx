"use client";
import { useState } from "react";

export function Counter() {
  const [n, setN] = useState(0);
  return (
    <div>
      <p aria-label="count">{n}</p>
      <button onClick={() => setN((v) => v + 1)}>+1</button>
    </div>
  );
}
