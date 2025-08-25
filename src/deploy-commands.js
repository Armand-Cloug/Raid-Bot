import "dotenv/config";
import { REST, Routes } from "discord.js";
import { readdir } from "node:fs/promises";
import { join } from "node:path";

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error("❌ DISCORD_TOKEN et CLIENT_ID sont requis dans .env");
  process.exit(1);
}

const commandsDir = join(process.cwd(), "src", "commands");
const files = (await readdir(commandsDir)).filter(f => f.endsWith(".js"));

const commands = [];
for (const file of files) {
  const { default: cmd } = await import(`./commands/${file}`);
  if (cmd?.data) commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

try {
  console.log("📦 Déploiement des commandes…");
  if (GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    console.log(`✅ Commandes de guilde déployées sur ${GUILD_ID}.`);
  } else {
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("✅ Commandes globales déployées.");
  }
} catch (err) {
  console.error("❌ Erreur de déploiement:", err);
  process.exit(1);
}
