const LOG_LEVELS = ["fatal", "error", "warn", "info", "debug", "trace"]; 

function levelIndex(name) {
  const i = LOG_LEVELS.indexOf((name || "info").toLowerCase());
  return i === -1 ? LOG_LEVELS.indexOf("info") : i;
}

const current = levelIndex(process.env.LOG_LEVEL || "info");

function fmt(level, msg, extra) {
  const ts = new Date().toISOString();
  const base = { ts, level, msg, ...extra };
  return JSON.stringify(base);
}

function log(level, msg, extra = undefined) {
  const idx = levelIndex(level);
  if (idx > current) return;
  const line = fmt(level, msg, extra);
  if (level === "error" || level === "fatal") console.error(line);
  else console.log(line);
}

module.exports = {
  fatal: (m, e) => log("fatal", m, e),
  error: (m, e) => log("error", m, e),
  warn: (m, e) => log("warn", m, e),
  info: (m, e) => log("info", m, e),
  debug: (m, e) => log("debug", m, e),
  trace: (m, e) => log("trace", m, e)
};

