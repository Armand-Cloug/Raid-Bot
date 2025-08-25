import {
  ActionRowBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";
import { CUSTOM_IDS } from "../utils/constants.js";
import { isAdminOrStaff } from "../utils/permissions.js";
import { getEventByMessage, removeEvent, upsertEvent } from "../utils/storage.js";

export default {
  data: new SlashCommandBuilder()
    .setName("raid")
    .setDescription("Créer ou gérer un raid.")
    .addSubcommand(sc =>
      sc.setName("create").setDescription("Ouvrir un formulaire pour créer un raid.")
    )
    .addSubcommand(sc =>
      sc.setName("cancel")
        .setDescription("Annuler le raid lié au message ciblé (ou dernier message du salon).")
        .addStringOption(o =>
          o.setName("message_id").setDescription("ID du message du raid").setRequired(false)
        )
    )
    .addSubcommand(sc =>
      sc.setName("remind")
        .setDescription("Activer/Désactiver le rappel T-15min pour ce raid.")
        .addStringOption(o =>
          o.setName("state").setDescription("enable/disable").setRequired(true)
            .addChoices({ name: "enable", value: "enable" }, { name: "disable", value: "disable" })
        )
        .addStringOption(o =>
          o.setName("message_id").setDescription("ID du message du raid").setRequired(false)
        )
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === "create") {
      if (!isAdminOrStaff(interaction.member)) {
        return interaction.reply({ content: "⛔ Seuls les admins/staff peuvent créer un raid.", ephemeral: true });
      }

      const modal = new ModalBuilder()
        .setCustomId(CUSTOM_IDS.RAID_CREATE_MODAL)
        .setTitle("Créer un raid");

      const title = new TextInputBuilder()
        .setCustomId(CUSTOM_IDS.FIELDS.TITLE)
        .setLabel("Titre / Nom du raid")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("Bastion of Steel")
        .setRequired(true)
        .setMaxLength(100);

      const date = new TextInputBuilder()
        .setCustomId(CUSTOM_IDS.FIELDS.DATE)
        .setLabel("Date (YYYY-MM-DD)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("2025-08-30")
        .setRequired(true);

      const time = new TextInputBuilder()
        .setCustomId(CUSTOM_IDS.FIELDS.TIME)
        .setLabel("Heure (HH:MM, 24h)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("20:30")
        .setRequired(true);

      const timezone = new TextInputBuilder()
        .setCustomId(CUSTOM_IDS.FIELDS.TIMEZONE)
        .setLabel("Fuseau (ex: +02:00) — optionnel")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("+02:00")
        .setRequired(false);

      const description = new TextInputBuilder()
        .setCustomId(CUSTOM_IDS.FIELDS.DESCRIPTION)
        .setLabel("Description — optionnel")
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder("Infos, stratégie, vocal, etc.")
        .setRequired(false)
        .setMaxLength(1000);

      modal.addComponents(
        new ActionRowBuilder().addComponents(title),
        new ActionRowBuilder().addComponents(date),
        new ActionRowBuilder().addComponents(time),
        new ActionRowBuilder().addComponents(timezone),
        new ActionRowBuilder().addComponents(description)
      );

      await interaction.showModal(modal);
      return;
    }

    if (sub === "cancel") {
      if (!isAdminOrStaff(interaction.member)) {
        return interaction.reply({ content: "⛔ Seuls les admins/staff peuvent annuler.", ephemeral: true });
      }

      const ref = interaction.options.getString("message_id")
        || interaction.channel?.lastMessage?.id
        || (await interaction.channel?.messages?.fetch({ limit: 1 }))?.first()?.id;

      if (!ref) return interaction.reply({ content: "❌ Impossible de trouver le message cible.", ephemeral: true });

      const evt = getEventByMessage(ref);
      if (!evt) return interaction.reply({ content: "❌ Aucun raid lié à ce message.", ephemeral: true });

      try {
        const msg = await interaction.channel.messages.fetch(ref);
        await msg.edit({ content: "🛑 **Raid annulé**", embeds: [] }).catch(() => {});
      } catch {}

      removeEvent(ref);
      await interaction.reply({ content: "✅ Raid annulé.", ephemeral: true });
      return;
    }

    if (sub === "remind") {
      if (!isAdminOrStaff(interaction.member)) {
        return interaction.reply({ content: "⛔ Seuls les admins/staff peuvent modifier le rappel.", ephemeral: true });
      }

      const state = interaction.options.getString("state", true);
      const ref = interaction.options.getString("message_id")
        || interaction.channel?.lastMessage?.id
        || (await interaction.channel?.messages?.fetch({ limit: 1 }))?.first()?.id;

      if (!ref) return interaction.reply({ content: "❌ Impossible de trouver le message cible.", ephemeral: true });

      const evt = getEventByMessage(ref);
      if (!evt) return interaction.reply({ content: "❌ Aucun raid lié à ce message.", ephemeral: true });

      evt.reminderEnabled = state === "enable";
      if (!evt.reminderEnabled) evt.reminderSent = false; // reset au cas où
      upsertEvent(evt);

      await interaction.reply({
        content: `✅ Rappel 15 min **${evt.reminderEnabled ? "activé" : "désactivé"}** pour ce raid.`,
        ephemeral: true
      });
      return;
    }
  }
};
