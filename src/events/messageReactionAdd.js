import { COLUMNS, EMOJI } from "../utils/constants.js";
import { getEventByMessage, upsertEvent } from "../utils/storage.js";
import { buildRaidEmbed } from "../utils/ui.js";
import { uniq } from "../utils/helpers.js";

export default {
  name: "messageReactionAdd",
  async execute(reaction, user) {
    try {
      if (user.bot) return;
      const emoji = reaction.emoji.name;
      if (![EMOJI.YES, EMOJI.MAYBE, EMOJI.NO].includes(emoji)) return;

      const msg = reaction.message.partial ? await reaction.message.fetch() : reaction.message;
      const evt = getEventByMessage(msg.id);
      if (!evt) return;

      // migration douce
      evt.signups    ||= { YES: [], MAYBE: [], NO: [] };
      evt.signupsIds ||= { YES: [], MAYBE: [], NO: [] };

      const member = await msg.guild.members.fetch(user.id).catch(() => null);
      const display = (member?.displayName || user.username || "Inconnu").trim();

      // nettoie des 3 colonnes
      for (const col of COLUMNS) {
        evt.signups[col]    = evt.signups[col].filter(n => n !== display);
        evt.signupsIds[col] = evt.signupsIds[col].filter(id => id !== user.id);
      }

      const col = emoji === EMOJI.YES ? "YES" : emoji === EMOJI.MAYBE ? "MAYBE" : "NO";
      evt.signups[col].push(display);
      evt.signupsIds[col].push(user.id);
      evt.signups[col]    = uniq(evt.signups[col]);
      evt.signupsIds[col] = uniq(evt.signupsIds[col]);

      // Retirer autres réactions de l'utilisateur
      for (const r of msg.reactions.cache.values()) {
        if (r.emoji.name !== emoji) r.users.remove(user.id).catch(() => {});
      }

      upsertEvent(evt);
      await msg.edit({ embeds: [buildRaidEmbed(evt)] }).catch(() => {});
    } catch (e) {
      console.error("messageReactionAdd error:", e);
    }
  }
};
