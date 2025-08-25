import { CUSTOM_IDS, EMOJI, COLUMNS } from "../utils/constants.js";
import { isAdminOrStaff } from "../utils/permissions.js";
import { isValidParts, parseIsoFromParts } from "../utils/helpers.js";
import { upsertEvent } from "../utils/storage.js";
import { buildRaidEmbed } from "../utils/ui.js";

export default {
  name: "interactionCreate",
  async execute(interaction, client) {
    // Slash commands
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      try {
        await cmd.execute(interaction);
      } catch (e) {
        console.error("Erreur commande:", e);
        const payload = { content: "❌ Une erreur est survenue.", ephemeral: true };
        if (interaction.deferred || interaction.replied) await interaction.followUp(payload).catch(() => {});
        else await interaction.reply(payload).catch(() => {});
      }
      return;
    }

    // Modal submit: création d'un raid
    if (interaction.isModalSubmit() && interaction.customId === CUSTOM_IDS.RAID_CREATE_MODAL) {
      if (!isAdminOrStaff(interaction.member)) {
        return interaction.reply({ content: "⛔ Permission refusée.", ephemeral: true });
      }

      const f = CUSTOM_IDS.FIELDS;
      const title = interaction.fields.getTextInputValue(f.TITLE)?.trim();
      const dateStr = interaction.fields.getTextInputValue(f.DATE)?.trim();
      const timeStr = interaction.fields.getTextInputValue(f.TIME)?.trim();
      const tzStr = (interaction.fields.getTextInputValue(f.TIMEZONE)?.trim() || "+00:00");
      const description = interaction.fields.getTextInputValue(f.DESCRIPTION)?.trim() || "";

      if (!isValidParts(dateStr, timeStr, tzStr)) {
        return interaction.reply({
          content: "❌ Format invalide. Exemples : date `2025-08-30`, heure `20:30`, fuseau `+02:00`.",
          ephemeral: true
        });
      }

      const iso = parseIsoFromParts(dateStr, timeStr, tzStr);
      if (!iso) {
        return interaction.reply({ content: "❌ Date/heure introuvable avec ce fuseau.", ephemeral: true });
      }

      const evt = {
        messageId: null,
        channelId: interaction.channelId,
        guildId: interaction.guildId,
        title,
        description,
        capacity: null,
        timestamp: iso,
        createdAt: new Date().toISOString(),
        signups: { YES: [], MAYBE: [], NO: [] },
        signupsIds: { YES: [], MAYBE: [], NO: [] },
        reminderEnabled: false,
        reminderSent: false
      };

      try {
        const embed = buildRaidEmbed(evt);
        const msg = await interaction.channel.send({ embeds: [embed] });
        evt.messageId = msg.id;

        await msg.react(EMOJI.YES);
        await msg.react(EMOJI.MAYBE);
        await msg.react(EMOJI.NO);

        upsertEvent(evt);
        await interaction.reply({ content: `✅ Raid créé : [message](${msg.url})`, ephemeral: true });
      } catch (e) {
        console.error("Création raid échouée:", e);
        await interaction.reply({ content: "❌ Impossible de créer le raid.", ephemeral: true });
      }
    }
  }
};
