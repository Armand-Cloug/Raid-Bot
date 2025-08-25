# Raid-Bot (Discord) — Canevas README

> Bot Discord en **Node.js (ESM)** pour planifier des **raids MMO** (Rift, WoW, …) avec **inscriptions via réactions** et **rappel T-15 min**.

## ✨ Fonctionnalités

- `/raid create` → **ouvre un modal** (Titre, Date, Heure, Fuseau, Description)  
- Widget d’inscription avec **colonnes** : ✅ Présents, 🤔 Incertains, ❌ Absents  
- Inscriptions par **réactions** (1 seule catégorie par personne, déduplication)  
- **Persistance** des raids dans `data/events.json` (survit aux redémarrages)  
- **Rappel 15 min avant** (optionnel par raid) qui **ping** les ✅  
- `/raid remind state:enable|disable` → active/désactive le rappel pour un raid  
- `/raid cancel` → annule un raid et nettoie le message  
- `/reboot` → redémarre le process **PM2** (nom par défaut : `raid-bot`)  
- **Resync au démarrage** : l’embed est rafraîchi automatiquement

---

## 🧱 Stack & prérequis

- Node.js **>= 18**
- `discord.js` v14
- PM2 (prod)
- Droits Discord pour créer des slash commands (applications.commands)
- Un rôle optionnel **Officer** (ou des admins) pour créer/gérer les raids

---

## 📦 Installation

```bash
git clone <ton-repo>
cd Raid-Bot
npm i
cp .env.example .env
```

Édite `.env` :

```dotenv
DISCORD_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLIENT_ID=123456789012345678
GUILD_ID=123456789012345678   # recommandé pour un déploiement instantané des slash commands

# Optionnels
OWNER_ID=123456789012345678   # autorise /reboot même sans permission Admin
PM2_PROCESS_NAME=raid-bot     # doit correspondre à ecosystem.config.cjs
RAID_STAFF_ROLE=Officer       # nom du rôle qui peut créer/annuler/configurer les raids
```

Crée (ou vérifie) le fichier de persistance :

```bash
mkdir -p data
echo '{ "events": [] }' > data/events.json
```

---

## 🤖 Création de l’app Discord

1. Va sur https://discord.com/developers/applications → **New Application**  
2. Onglet **Bot** → **Reset Token** → colle dans `DISCORD_TOKEN`  
3. Onglet **OAuth2 → URL Generator** : scopes **bot** et **applications.commands**  
4. Invite le bot sur ton serveur  
5. Aucune *privileged intent* requise pour ce bot (il lit les guilds/msgs/réactions)

---

## 🧪 Déployer les commandes (slash)

```bash
npm run deploy:commands
```

- Avec `GUILD_ID` → apparition **immédiate** dans ce serveur  
- Sans `GUILD_ID` → en **global** (peut prendre un moment)

---

## 🚀 Lancer le bot

### Dev (sans PM2)
```bash
npm run dev
```

### Prod (avec PM2)
```bash
npm run start         # pm2 start ecosystem.config.cjs
npm run logs          # pm2 logs raid-bot
npm run restart       # pm2 restart raid-bot
```

---

## 🕹️ Utilisation

- **Créer un raid**
  ```
  /raid create
  ```
  → Remplis le **modal** :  
  - **Titre**: “Bastion of Steel”  
  - **Date**: `2025-08-30`  
  - **Heure**: `20:30`  
  - **Fuseau**: `+02:00` (optionnel, défaut `+00:00`)  
  - **Description** (optionnel)

- **S’inscrire** : réagir au message du raid avec  
  - ✅ = Présent  
  - 🤔 = Incertain  
  - ❌ = Absent  
  (Le bot gère l’unicité et met à jour la colonne correspondante.)

- **Activer le rappel T-15 min** pour ce raid (dans le salon du raid) :
  ```
  /raid remind state:enable
  ```
  Pour désactiver :
  ```
  /raid remind state:disable
  ```

- **Annuler un raid** :
  ```
  /raid cancel
  ```
  (Option : `message_id:<ID>` si ce n’est pas le dernier message du salon.)

- **Redémarrer le bot (PM2)** :
  ```
  /reboot
  ```

> 🔔 Le rappel T-15 min ping **uniquement les utilisateurs ✅**.

---

## 🗂️ Arborescence

```
raid-bot/
├─ package.json
├─ ecosystem.config.cjs
├─ .env.example
├─ data/
│  └─ events.json
└─ src/
   ├─ index.js                # point d’entrée
   ├─ bot.js                  # client + chargement commandes/événements
   ├─ deploy-commands.js      # script de déploiement des slash commands
   ├─ loaders/
   │  ├─ commandLoader.js     # charge automatiquement src/commands/*
   │  └─ eventLoader.js       # charge automatiquement src/events/*
   ├─ utils/
   │  ├─ constants.js         # emojis, IDs custom, etc.
   │  ├─ permissions.js       # isAdminOrStaff
   │  ├─ storage.js           # persistance JSON (events.json)
   │  ├─ ui.js                # construction de l’embed du raid
   │  └─ helpers.js           # parse/validation, uniq, …
   ├─ commands/
   │  ├─ raid.js              # /raid create|cancel|remind
   │  └─ reboot.js            # /reboot PM2
   ├─ events/
   │  ├─ ready.js             # resync + start scheduler
   │  ├─ interactionCreate.js # slash commands + modal submit
   │  ├─ messageReactionAdd.js
   │  └─ messageReactionRemove.js
   └─ schedulers/
      └─ reminder.js          # rappel 15 min avant (ping des ✅)
```

---

## 🧰 Scripts npm

```json
{
  "dev": "node src/index.js",
  "deploy:commands": "node src/deploy-commands.js",
  "start": "pm2 start ecosystem.config.cjs",
  "restart": "pm2 restart raid-bot",
  "stop": "pm2 stop raid-bot",
  "logs": "pm2 logs raid-bot"
}
```

---

## 🔐 Permissions & rôles

- **Admins** peuvent tout faire.  
- Rôle **Raid Staff** (nom défini dans `.env`) → peut créer/annuler/configurer les raids.  
- `/reboot` autorisé aux **admins** + **OWNER_ID** (si défini).

---

## 🧠 Notes & limites

- **Modal Discord : 5 champs max** (on a choisi *Description* plutôt que *Capacité*).  
- Les **pseudos affichés** sont ceux **du serveur** (displayName).  
- Le **rappel** se déclenche **une seule fois** par raid (flag `reminderSent`).

---

## 🩺 Dépannage (FAQ)

- **Erreur** `ERR_IMPORT_ASSERTION_TYPE_UNSUPPORTED`  
  → Corrigé en utilisant `pathToFileURL` dans les loaders (pas d’assertion `type: "javascript"`).

- **Plusieurs “✅ Connecté …” dans les logs**  
  → Vérifie les instances :
  ```bash
  pm2 list
  pm2 describe raid-bot
  ```
  Il ne doit y avoir **qu’une** instance. Sinon :
  ```bash
  pm2 delete raid-bot
  pm2 start ecosystem.config.cjs
  ```

- **Warning** “Supplying \`ephemeral\`… is deprecated”  
  → Non bloquant. Migration future vers les **flags** d’Interaction (à faire plus tard).

- **Les réactions ne mettent pas à jour l’embed**  
  → Vérifie que le bot a l’intent **GuildMessageReactions** (inclus) et les permissions dans le salon.

---

## 🗺️ Roadmap (canevas)

- [ ] `/raid edit` (ouvrir un modal pour modifier titre/date/heure/desc)  
- [ ] Capacités et **rôles/classes** (Tanks/Heals/DPS par colonnes ou sous-colonnes)  
- [ ] Boutons/menus au lieu des réactions (option UX)  
- [ ] **Listage** des raids `/raid list` + navigation  
- [ ] Export **CSV** des présences  
- [ ] **Multi-langue** (FR/EN)  
- [ ] Tests automatisés + linting

---

## 🤝 Contribuer (canevas)

1. Fork & branche (`feat/ma-feature`)  
2. Commits clairs (Conventional Commits recommandé)  
3. PR avec description, screenshots/vidéos si besoin

---

## 📄 Licence

Choisis une licence (MIT, Apache-2.0, GPL-3.0…).  
Exemple : **MIT**.

---

## 👤 Crédits

- Dev : **Cloug**  
- Stack : Node.js / discord.js / PM2
