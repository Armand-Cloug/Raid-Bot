import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "..", "data", "events.json");

function ensureFile() {
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (!existsSync(DB_PATH)) writeFileSync(DB_PATH, JSON.stringify({ events: [] }, null, 2));
}

export function loadDB() {
  ensureFile();
  try {
    const data = JSON.parse(readFileSync(DB_PATH, "utf8"));
    // migration douce
    for (const e of data.events || []) {
      e.signups    ||= { YES: [], MAYBE: [], NO: [] };
      e.signupsIds ||= { YES: [], MAYBE: [], NO: [] };
      if (typeof e.reminderEnabled !== "boolean") e.reminderEnabled = false;
      if (typeof e.reminderSent !== "boolean") e.reminderSent = false;
    }
    return data;
  } catch {
    return { events: [] };
  }
}

export function saveDB(db) {
  ensureFile();
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export function upsertEvent(evt) {
  const db = loadDB();
  const i = db.events.findIndex(e => e.messageId === evt.messageId);
  if (i >= 0) db.events[i] = evt; else db.events.push(evt);
  saveDB(db);
}

export function getEventByMessage(messageId) {
  const db = loadDB();
  return db.events.find(e => e.messageId === messageId);
}

export function removeEvent(messageId) {
  const db = loadDB();
  db.events = db.events.filter(e => e.messageId !== messageId);
  saveDB(db);
}

export function allEvents() {
  return loadDB().events;
}
