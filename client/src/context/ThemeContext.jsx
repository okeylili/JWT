import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

const getInitialTheme = () => localStorage.getItem("theme.mode") || "dark";
const getInitialAccent = () => localStorage.getItem("theme.accent") || "#7c8cff";

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialTheme);
  const [accent, setAccent] = useState(getInitialAccent);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("theme.mode", mode);
  }, [mode]);

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    localStorage.setItem("theme.accent", accent);
  }, [accent]);

  const value = useMemo(
    () => ({ mode, setMode, accent, setAccent }),
    [mode, accent]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
