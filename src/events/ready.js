import { allEvents } from "../utils/storage.js";
import { buildRaidEmbed } from "../utils/ui.js";
import { startReminderScheduler } from "../schedulers/reminder.js";

export default {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);

    // Re-sync des embeds au démarrage
    for (const evt of allEvents()) {
      try {
        const channel = await client.channels.fetch(evt.channelId);
        if (!channel) continue;
        const msg = await channel.messages.fetch(evt.messageId);
        if (!msg) continue;
        await msg.edit({ embeds: [buildRaidEmbed(evt)] });
      } catch {
        // message supprimé
      }
    }

    // Lance le scheduler des rappels
    startReminderScheduler(client);
  }
};
