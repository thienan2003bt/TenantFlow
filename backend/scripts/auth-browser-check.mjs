import { createServer } from "node:http";

const page = String.raw`<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>TenantFlow registration check</title>
<style>
body { font: 16px system-ui; max-width: 900px; margin: 40px auto; padding: 16px; }
button { margin: 8px 8px 8px 0; padding: 10px; }
pre { white-space: pre-wrap; background: #f1f5f9; padding: 16px; }
</style>
<h1>Registration browser check</h1>
<p>These checks use test credentials and create one pending account in your local database.</p>
<p>Restart the API before running the six-request sequence. Repeat runs share its hourly limit.</p>
<p id="context"></p>
<button id="connect">Check API connection</button>
<button id="register">Run six registration checks</button>
<pre id="result">Ready. Check the API connection first.</pre>
<script>
const output = document.querySelector("#result");
document.querySelector("#context").textContent = "Origin: " + location.origin + " | Secure context: " + isSecureContext;
function ensureContext() {
  if (location.origin !== "http://localhost:3000" || !isSecureContext || window !== window.top) {
    throw new Error("Open http://localhost:3000 in a normal top-level browser tab and use that page's console.");
  }
}
globalThis.browserCredentials = {
  email: "browser-check-" + Date.now() + "@example.com",
  password: "Allowed-Reg-7391!",
};
globalThis.registerAuth = async (payload) => {
  ensureContext();
  const response = await fetch("http://localhost:14400/auth/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return {
    status: response.status,
    body: await response.json(),
    cacheControl: response.headers.get("Cache-Control"),
    retryAfter: response.headers.get("Retry-After"),
  };
};
async function run(action) {
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => { button.disabled = true; });
  output.textContent = "";
  try {
    ensureContext();
    await action();
  } catch (error) {
    output.textContent += String(error) + "\nCheck the page address, selected console context, and API terminal.";
  } finally {
    buttons.forEach((button) => { button.disabled = false; });
  }
}
document.querySelector("#connect").onclick = () => run(async () => {
  const response = await fetch("http://localhost:14400/health-check", { credentials: "include" });
  output.textContent = "API status: " + response.status + "\n" + await response.text();
});
document.querySelector("#register").onclick = () => run(async () => {
  const input = browserCredentials;
  const cases = [
    ["New account", input, 202],
    ["Duplicate", { ...input, email: " " + input.email.toUpperCase() + " ", password: "Different-Allowed-8329!" }, 202],
    ["Weak password", { ...input, password: "weak" }, 400],
    ["Blocklisted password", { ...input, password: "Password1!" }, 400],
    ["Unknown field", { ...input, toString: "unexpected" }, 400],
    ["Hourly limit", input, 429],
  ];
  for (const [name, payload, expected] of cases) {
    const result = await registerAuth(payload);
    output.textContent += name + ": expected " + expected + ", received " + result.status + "\n";
    output.textContent += JSON.stringify(result, null, 2) + "\n\n";
    if (result.status !== expected) {
      throw new Error("Unexpected response. Restart the API to reset its limit before a fresh sequence.");
    }
  }
});
</script>
</html>`;

const server = createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  response.end(page);
});
server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? "Port 3000 is in use. Stop its server before starting this check page."
      : error.message,
  );
  process.exitCode = 1;
});
server.listen(3000, "127.0.0.1", () => {
  console.log("Open http://localhost:3000 in a normal browser tab. Stop this page with Ctrl+C.");
});
function stop() {
  server.close();
  server.closeAllConnections();
}
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
