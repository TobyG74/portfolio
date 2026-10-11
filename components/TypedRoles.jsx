"use client";

import { useEffect, useState } from "react";

export default function TypedRoles({ roles = [] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!roles.length) return;
    const full = roles[index % roles.length];
    let timeout;

    if (!deleting && text === full) {
      timeout = setTimeout(() => setDeleting(true), 1600);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % roles.length);
    } else {
      timeout = setTimeout(() => {
        setText((prev) =>
          deleting ? full.slice(0, prev.length - 1) : full.slice(0, prev.length + 1)
        );
      }, deleting ? 45 : 85);
    }

    return () => clearTimeout(timeout);
  }, [text, deleting, index, roles]);

  return (
    <span>
      {text}
      <span aria-hidden="true" className="ml-0.5 inline-block w-[2px] animate-blink bg-fg align-middle" style={{ height: "1.1em" }} />
    </span>
  );
}
