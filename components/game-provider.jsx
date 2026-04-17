"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [isReady, setIsReady] = useState(false);
  const [playerName, setPlayerName] = useState("Guest");
  const [questStarted, setQuestStarted] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [levelUpEvent, setLevelUpEvent] = useState(null);

  useEffect(() => {
    const storedName = localStorage.getItem("playerName") || "Guest";
    const started = localStorage.getItem("questStarted") === "true";
    const xp = Number(localStorage.getItem("playerXP") || "0");

    setPlayerName(storedName);
    setQuestStarted(started);
    setTotalXp(Number.isFinite(xp) ? xp : 0);
    setIsReady(true);
  }, []);

  const startQuest = (name) => {
    const safeName = name.trim().slice(0, 20) || "Guest";
    localStorage.setItem("playerName", safeName);
    localStorage.setItem("questStarted", "true");
    setPlayerName(safeName);
    setQuestStarted(true);
  };

  const resetQuest = () => {
    localStorage.removeItem("playerName");
    localStorage.removeItem("questStarted");
    localStorage.removeItem("playerXP");
    setPlayerName("Guest");
    setQuestStarted(false);
    setTotalXp(0);
  };

  const addXp = (amount) => {
    setTotalXp((prev) => {
      const oldLevel = Math.floor(prev / 100) + 1;
      const next = Math.max(0, prev + amount);
      const newLevel = Math.floor(next / 100) + 1;

      if (newLevel > oldLevel) {
        setLevelUpEvent({ level: newLevel, id: Date.now() });
      }

      localStorage.setItem("playerXP", String(next));
      return next;
    });
  };

  const consumeLevelUpEvent = () => {
    setLevelUpEvent(null);
  };

  const level = Math.floor(totalXp / 100) + 1;
  const xpInLevel = totalXp % 100;

  const value = useMemo(
    () => ({
      isReady,
      playerName,
      questStarted,
      totalXp,
      level,
      xpInLevel,
      startQuest,
      resetQuest,
      addXp,
      levelUpEvent,
      consumeLevelUpEvent,
    }),
    [isReady, playerName, questStarted, totalXp, level, xpInLevel, levelUpEvent],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }
  return context;
}
