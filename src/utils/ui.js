import { EmbedBuilder } from "discord.js";
import { EMOJI } from "./constants.js";

function formatNames(names) {
  return names.length ? names.map(n => `• ${n}`).join("\n") : "–";
}

export function buildRaidEmbed(evt) {
  const when = `<t:${Math.floor(new Date(evt.timestamp).getTime() / 1000)}:F>`;
  const title = `📅 ${evt.title}`;

  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(evt.description || "")
    .addFields(
      { name: "🕒 Date & heure", value: when, inline: false },
      { name: `${EMOJI.YES} YES`, value: formatNames(evt.signups.YES), inline: true },
      { name: `${EMOJI.MAYBE} MAYBE`, value: formatNames(evt.signups.MAYBE), inline: true },
      { name: `${EMOJI.NO} NO`, value: formatNames(evt.signups.NO), inline: true }
    )
    .setFooter({ text: `Raid ID: ${evt.messageId || "—"}` })
    .setTimestamp(new Date(evt.createdAt || Date.now()));
}
