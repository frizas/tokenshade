let timer = null;

export function showDisconnected(windowApi) {
  windowApi.showDialog({
    title: "Raybox took a nap",
    message: "Your shelf is safe. Raybox will bring the light back shortly.",
    accent: "#FF6B5F",
  });
}

export function scheduleReconnect(session, delayMs = 2000) {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    session.cancelPendingLogin();
    session.login();
  }, delayMs);
  return timer;
}

export function cancelReconnect() {
  if (!timer) return false;
  clearTimeout(timer);
  timer = null;
  return true;
}
