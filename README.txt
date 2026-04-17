# Discord Bot - Chidera

A feature-rich Discord.js bot with moderation, logging, and utility commands.

## Features

### 🤖 Core Bot Features
- **Auto-restart system** - Automatically restarts on crashes and unhandled errors
- **Comprehensive error handling** - Catches and logs all types of errors
- **Daily health checks** - Sends daily status reports to the bot owner
- **Environment validation** - Validates all required environment variables on startup

### 📋 Slash Commands
- `/ping` - Replies with "pong 🏓" (6-second cooldown)
- `/server` - Displays server information including name and member count (10-second cooldown)
- `/user` - Shows your user tag and Discord ID (6-second cooldown)
- `/status` - Sends detailed bot status report via DM (15-second cooldown)

### 📊 Status Command Features
The `/status` command provides:
- Bot uptime in days, hours, minutes, and seconds
- Memory usage in MB
- Bot ping/response time
- Current timestamp

### 🔒 Security & Moderation
- **Command cooldowns** - Prevents spam with customizable cooldowns per command
- **Owner-only features** - Status reports and logs sent to bot owner
- **DM logging** - Sensitive information sent via direct messages

### 📝 Logging & Monitoring
The bot automatically logs various server activities to the owner:
- **Message deletions** - Logs deleted messages with content, author, and channel
- **Message edits** - Tracks message changes with before/after content
- **Channel creation** - Notifies when new channels are created
- **Voice activity** - Logs when users join/leave voice channels
- **Bot startup** - Notifies when the bot comes online
- **Error reports** - Detailed error logging for debugging

### 🛠️ Technical Features
- **Discord.js v14** - Built with the latest Discord.js framework
- **Slash commands only** - Modern command system with better user experience
- **Environment variables** - Secure configuration using .env file
- **Memory management** - Efficient memory usage tracking
- **Process monitoring** - Uptime tracking and performance metrics

## Setup Instructions

### Prerequisites
- Node.js installed
- Discord bot application created
- Bot token, client ID, and guild ID

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   TOKEN=your_bot_token
   CLIENT_ID=your_bot_client_id
   GUILD_ID=your_server_guild_id
   OWNER_ID=your_discord_user_id
   ```

### Running the Bot
- Start the bot: `node Chidera.js`
- The bot will automatically register slash commands for your guild

## Environment Variables

### Required
- `TOKEN` - Discord bot token
- `CLIENT_ID` - Discord application client ID
- `GUILD_ID` - Server guild ID for command registration

### Optional
- `OWNER_ID` - Discord user ID for receiving logs and status reports

## Command Cooldowns
- `/ping`: 6 seconds
- `/user`: 6 seconds
- `/server`: 10 seconds
- `/status`: 15 seconds

## Dependencies
- `discord.js@^14.22.1` - Discord API wrapper
- `dotenv@^17.2.2` - Environment variable management

## Bot Intents
The bot uses the following Discord intents:
- Guilds
- GuildMessages
- MessageContent
- GuildMembers
- GuildMessageReactions
- GuildVoiceStates

## Error Handling
The bot includes comprehensive error handling for:
- Uncaught exceptions
- Unhandled promise rejections
- Discord.js client errors
- Command execution errors

All errors are automatically logged to the bot owner and the bot will attempt to restart on critical errors.

## Privacy & Security
- Sensitive data (status reports) sent via DM only
- Environment variables used for secure configuration
- No hardcoded credentials in source code
- Message content logged only for moderation purposes
