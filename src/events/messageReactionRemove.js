import { COLUMNS, EMOJI } from "../utils/constants.js";
import { getEventByMessage, upsertEvent } from "../utils/storage.js";
import { buildRaidEmbed } from "../utils/ui.js";

export default {
  name: "messageReactionRemove",
  async execute(reaction, user) {
    try {
      if (user.bot) return;
      const emoji = reaction.emoji.name;
      if (![EMOJI.YES, EMOJI.MAYBE, EMOJI.NO].includes(emoji)) return;

      const msg = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
      const evt = getEventByMessage(msg.id);
      if (!evt) return;

      const member = await msg.guild.members.fetch(user.id).catch(() => null);
      const display = (member?.displayName || user.username || "Inconnu").trim();

      // Retire des 3 colonnes
      for (const col of COLUMNS) {
        evt.signups[col]    = evt.signups[col].filter(n => n !== display);
        evt.signupsIds[col] = evt.signupsIds[col].filter(id => id !== user.id);
      }

      upsertEvent(evt);
      await msg.edit({ embeds: [buildRaidEmbed(evt)] }).catch(() => {});
    } catch (e) {
      console.error("messageReactionRemove error:", e);
    }
  }
};
