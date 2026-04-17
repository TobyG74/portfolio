"use client";

import { useEffect, useState } from "react";

const ROLES = [
  "Full Stack Developer",
  "Code Warrior",
  "Software Engineer",
  "Anime Enthusiast",
  "Problem Solver",
];

export default function TypedRoles() {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = ROLES[textIndex];
    const timeout = setTimeout(
      () => {
        if (isDeleting) {
          setCharIndex((prev) => prev - 1);
          if (charIndex <= 1) {
            setIsDeleting(false);
            setTextIndex((prev) => (prev + 1) % ROLES.length);
          }
        } else {
          setCharIndex((prev) => prev + 1);
          if (charIndex >= currentText.length) {
            setTimeout(() => setIsDeleting(true), 1100);
          }
        }
      },
      isDeleting ? 45 : 90,
    );

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex]);

  return (
    <span className="text-xl text-quest-accent md:text-2xl">
      {ROLES[textIndex].slice(0, charIndex)}
      <span className="animate-pulse">|</span>
    </span>
  );
}
