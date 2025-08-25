import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function loadCommands(client) {
  const commandsDir = join(process.cwd(), "src", "commands");
  const files = (await readdir(commandsDir)).filter(f => f.endsWith(".js"));

  for (const file of files) {
    const moduleUrl = pathToFileURL(join(commandsDir, file)).href;
    const { default: command } = await import(moduleUrl);
    if (command?.data?.name && typeof command.execute === "function") {
      client.commands.set(command.data.name, command);
    }
  }
}
