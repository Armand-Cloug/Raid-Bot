import "dotenv/config";
import { Client, Collection, GatewayIntentBits, Partials } from "discord.js";
import { loadCommands } from "./loaders/commandLoader.js";
import { loadEvents } from "./loaders/eventLoader.js";

export async function startBot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
  });

  client.commands = new Collection();

  await loadCommands(client);
  await loadEvents(client);

  await client.login(process.env.DISCORD_TOKEN);
}
