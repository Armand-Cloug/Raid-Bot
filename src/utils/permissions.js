import { PermissionFlagsBits } from "discord.js";

export function isAdminOrStaff(member) {
  if (!member) return false;
  const isAdmin = member.permissions?.has(PermissionFlagsBits.Administrator);
  const staffRoleName = process.env.RAID_STAFF_ROLE;
  const isStaff = !!(staffRoleName && member.roles?.cache?.some(r => r.name === staffRoleName));
  return isAdmin || isStaff;
}
