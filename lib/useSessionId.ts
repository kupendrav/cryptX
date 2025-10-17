"use client";
import { useEffect, useState } from "react";
import { randomId } from "./uuid";

export function useSessionId() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const existing = typeof window !== "undefined" ? window.localStorage.getItem("sessionId") : null;
      if (existing) {
        setSessionId(existing);
      } else {
        const sid = randomId();
        if (typeof window !== "undefined") {
          window.localStorage.setItem("sessionId", sid);
        }
        setSessionId(sid);
      }
    } catch {
      setSessionId(randomId());
    }
  }, []);

  return sessionId;
}
