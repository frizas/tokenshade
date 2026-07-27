const overrides = new Map();
let activeTheme = "system";

export function setTheme(theme) {
  activeTheme = theme;
}

export function setOpacity(component, opacity) {
  const value = Math.max(0, Math.min(1, Number(opacity)));
  overrides.set(component, value);
  return value;
}

export function getSnapshot() {
  return {
    activeTheme,
    opacity: Object.fromEntries(overrides),
  };
}

export function onSessionStart() {
  setTheme("raybox-dark");
  setOpacity("connection-indicator", 0.75);
}

export function onSessionEnd() {
  setTheme("system");
  setOpacity("connection-indicator", 1);
}

export function terminate() {
  overrides.clear();
  activeTheme = "system";
}
