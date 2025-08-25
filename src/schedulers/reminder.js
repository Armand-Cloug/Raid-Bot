import { allEvents, upsertEvent } from "../utils/storage.js";

export function startReminderScheduler(client) {
  setInterval(async () => {
    const now = Date.now();
    for (const evt of allEvents()) {
      if (!evt.reminderEnabled || evt.reminderSent) continue;

      const ts = new Date(evt.timestamp).getTime();
      const delta = ts - now; // ms jusqu'au raid

      // Fenêtre d'envoi: dans les 15 prochaines minutes (positif)
      if (delta <= 15 * 60 * 1000 && delta > 0) {
        try {
          const channel = await client.channels.fetch(evt.channelId);
          if (!channel) continue;

          const yesIds = (evt.signupsIds?.YES || []).filter(Boolean);
          if (yesIds.length === 0) {
            evt.reminderSent = true;
            upsertEvent(evt);
            continue;
          }

          const mentions = yesIds.map(id => `<@${id}>`).join(" ");
          const when = `<t:${Math.floor(ts / 1000)}:t>`;
          await channel.send({
            content: `⏰ **Rappel Raid dans 15 minutes** → ${evt.title}\n${mentions}\nRDV à ${when} !`
          });

          evt.reminderSent = true;
          upsertEvent(evt);
        } catch {
          // ignore
        }
      }
    }
  }, 60 * 1000);
}
