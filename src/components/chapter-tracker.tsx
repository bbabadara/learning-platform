"use client";

import { useEffect, useRef } from "react";

export default function ChapterTracker({
  chapterId,
  hasSession,
}: {
  chapterId: string;
  hasSession: boolean;
}) {
  const done = useRef(false);

  useEffect(() => {
    if (!hasSession || done.current) return;
    done.current = true;
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterId, status: "in_progress", lastReadAt: true }),
    }).catch(() => {});
  }, [chapterId, hasSession]);

  return null;
}
