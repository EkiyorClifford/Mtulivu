const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  Collection
} = require('discord.js');
require('dotenv').config();
const { spawn } = require('child_process');

// --- ENV CHECKS ---
if (!process.env.TOKEN) {
  console.error("❌ Missing TOKEN in .env");
  process.exit(1);
}
if (!process.env.CLIENT_ID) {
  console.error("❌ Missing CLIENT_ID in .env");
  process.exit(1);
}
if (!process.env.GUILD_ID) {
  console.error("❌ Missing GUILD_ID in .env");
  process.exit(1);
}
if (!process.env.OWNER_ID) {
  console.warn("⚠️ Missing OWNER_ID in .env (logs/DMs will fail)");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates
  ],
});

client.commands = new Collection();

// --- Slash Commands ---
const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Replies with pong 🏓'),
  new SlashCommandBuilder().setName('server').setDescription('Get server info 📊'),
  new SlashCommandBuilder().setName('user').setDescription('Get your user info 👤'),
  new SlashCommandBuilder().setName('status').setDescription('DMs the bot status 🛠️'),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Refreshing slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );
    console.log('✅ Slash commands registered (Guild).');
  } catch (error) {
    console.error("❌ Failed to register commands:", error);
  }
})();

// --- Helper: Send Log/DM ---
async function sendLog(message) {
  try {
    if (!process.env.OWNER_ID) return;
    const owner = await client.users.fetch(process.env.OWNER_ID);
    await owner.send(message);
  } catch (err) {
    console.error("❌ Failed to send DM:", err);
  }
}

// --- Cooldowns ---
const commandCooldowns = {
  ping: 6000,
  user: 6000,
  server: 10000,
  status: 15000
};
const cooldowns = new Collection();

const cooldownMessages = {
  ping: (remaining) => `🏓 Chill champ, wait **${remaining}s** before smacking /ping again.`,
  user: (remaining) => `👤 Easy there! Wait **${remaining}s** before checking yourself again.`,
  server: (remaining) => `📊 The server needs a breather. Try again in **${remaining}s**.`,
  status: (remaining) => `🛠️ Relax boss, I just checked! Give me **${remaining}s** before another /status.`,
  default: (remaining) => `⏳ Please wait **${remaining}s** before using this command again.`
};

// --- Events ---
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  sendLog(`🤖 Bot is now online as **${client.user.tag}**`);

  // Daily health check
  setInterval(() => {
    sendLog(`✅ Daily Health Check: Bot **${client.user.tag}** is still running at ${new Date().toLocaleString()}`);
  }, 24 * 60 * 60 * 1000);
});

// Slash command handler
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName, user } = interaction;

  // Cooldown logic
  const now = Date.now();
  if (!cooldowns.has(commandName)) {
    cooldowns.set(commandName, new Collection());
  }

  const timestamps = cooldowns.get(commandName);
  const cooldownAmount = commandCooldowns[commandName] || 3000;

  if (timestamps.has(user.id)) {
    const expiration = timestamps.get(user.id) + cooldownAmount;
    if (now < expiration) {
      const remaining = ((expiration - now) / 1000).toFixed(1);
      const messageFn = cooldownMessages[commandName] || cooldownMessages.default;
      return interaction.reply({ content: messageFn(remaining), ephemeral: true });
    }
  }

  timestamps.set(user.id, now);
  setTimeout(() => timestamps.delete(user.id), cooldownAmount);

  try {
    if (commandName === 'ping') {
      await interaction.reply('pong 🏓');

    } else if (commandName === 'server') {
      await interaction.reply(`📊 Server name: ${interaction.guild.name}\nMembers: ${interaction.guild.memberCount}`);

    } else if (commandName === 'user') {
      await interaction.reply(`👤 Your tag: ${interaction.user.tag}\nID: ${interaction.user.id}`);

    } else if (commandName === 'status') {
      const uptime = formatDuration(process.uptime());
      const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const ping = Date.now() - interaction.createdTimestamp;

      const statusMessage =
        `🛠️ **Bot Status Report**\n\n` +
        `🤖 Uptime: ${uptime}\n` +
        `💾 Memory Usage: ${memory} MB\n` +
        `📡 Ping: ${ping}ms\n` +
        `🕒 Time: ${new Date().toLocaleString()}`;

      const owner = await client.users.fetch(process.env.OWNER_ID);
      await owner.send(statusMessage);

      await interaction.reply({ content: "✅ Status sent to your DM!", ephemeral: true });
    }
  } catch (err) {
    console.error("Command error:", err);
    sendLog(`❌ Error while executing command \`${commandName}\`:\n\`\`\`${err}\`\`\``);
  }
});

// --- Format Uptime Helper ---
function formatDuration(seconds) {
  const days = Math.floor(seconds / (3600*24));
  seconds %= 3600*24;
  const hrs = Math.floor(seconds / 3600);
  seconds %= 3600;
  const mins = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);

  return `${days}d ${hrs}h ${mins}m ${seconds}s`;
}

// --- DM Logging ---
client.on('messageDelete', (message) => {
  if (message.partial) return;
  sendLog(`🗑️ Message deleted in #${message.channel.name}:\n"${message.content}" by ${message.author?.tag}`);
});

client.on('messageUpdate', (oldMessage, newMessage) => {
  if (oldMessage.partial || newMessage.partial) return;
  sendLog(`✏️ Message edited in #${oldMessage.channel.name}:\n"${oldMessage}" → "${newMessage}"`);
});

client.on('channelCreate', (channel) => {
  sendLog(`📂 New channel created: ${channel.name}`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (!oldState.channel && newState.channel) {
    sendLog(`🎤 ${newState.member.user.tag} joined voice channel: ${newState.channel.name}`);
  } else if (oldState.channel && !newState.channel) {
    sendLog(`🔇 ${oldState.member.user.tag} left voice channel: ${oldState.channel.name}`);
  }
});

// --- Auto-Restart System ---
function restartBot() {
  sendLog("🔄 Restarting bot due to crash...");
  const subprocess = spawn(process.argv[0], process.argv.slice(1), {
    cwd: process.cwd(),
    detached: true,
    stdio: "inherit"
  });
  subprocess.unref();
  process.exit(1);
}

process.on('uncaughtException', (err) => {
  console.error("Uncaught Exception:", err);
  sendLog(`💥 **Uncaught Exception:**\n\`\`\`${err}\`\`\``);
  restartBot();
});

process.on('unhandledRejection', (reason) => {
  console.error("Unhandled Rejection:", reason);
  sendLog(`⚠️ **Unhandled Rejection:**\n\`\`\`${reason}\`\`\``);
  restartBot();
});

client.on('error', (err) => {
  console.error("Discord.js Client Error:", err);
  sendLog(`🚨 **Discord.js Client Error:**\n\`\`\`${err}\`\`\``);
});

client.login(process.env.TOKEN);
