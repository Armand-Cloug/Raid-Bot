import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function loadEvents(client) {
  const eventsDir = join(process.cwd(), "src", "events");
  const files = (await readdir(eventsDir)).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const moduleUrl = pathToFileURL(join(eventsDir, file)).href;
    const { default: event } = await import(moduleUrl);
    if (!event?.name || typeof event.execute !== "function") continue;

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}
