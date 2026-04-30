import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { palette } from "./palette";

const STORAGE_KEY = "flowcash_theme_mode";
const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const storedMode = await AsyncStorage.getItem(STORAGE_KEY);
        if (
          storedMode === "light" ||
          storedMode === "dark" ||
          storedMode === "system"
        ) {
          setThemeMode(storedMode);
        }
      } catch (error) {
        console.error("Theme mode load failed", error);
      } finally {
        setReady(true);
      }
    };

    loadThemeMode();
  }, []);

  const updateThemeMode = useCallback(async (mode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.error("Theme mode save failed", error);
    }
  }, []);

  const resolvedMode =
    themeMode === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : themeMode;
  const theme = palette[resolvedMode];

  const value = useMemo(
    () => ({
      ready,
      theme,
      themeMode,
      resolvedMode,
      setThemeMode: updateThemeMode,
      toggleTheme: () =>
        updateThemeMode(resolvedMode === "dark" ? "light" : "dark"),
    }),
    [ready, resolvedMode, theme, themeMode, updateThemeMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};
