export const getNavigationTheme = (theme) => ({
  dark: theme.mode === "dark",
  colors: {
    primary: theme.primary,
    background: theme.background,
    card: theme.surface,
    text: theme.text,
    border: theme.border,
    notification: theme.danger,
  },
});
