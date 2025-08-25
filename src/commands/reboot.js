import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { exec } from "node:child_process";

export default {
  data: new SlashCommandBuilder()
    .setName("reboot")
    .setDescription("Redémarre le bot via PM2.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const ownerId = process.env.OWNER_ID?.trim();
    const isOwner = ownerId && interaction.user.id === ownerId;
    const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.Administrator);
    if (!(isOwner || isAdmin)) {
      return interaction.reply({ content: "⛔ Permission refusée.", ephemeral: true });
    }
    const name = process.env.PM2_PROCESS_NAME || "raid-bot";
    await interaction.reply({ content: `🔁 Redémarrage \`${name}\`…`, ephemeral: true });

    exec(`pm2 restart ${name}`, (error) => {
      if (error) {
        interaction.followUp({ content: `❌ Échec: \`${error.message}\``, ephemeral: true }).catch(() => {});
      }
    });
  }
};
