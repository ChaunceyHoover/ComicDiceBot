import { Client, GatewayIntentBits } from 'discord.js';
import { parseDiceRoll } from './dice-rolls.js';

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
] });

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
	}
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    
    // Split message by each word said
    const words = message.content.split(/\s/);

    for (const indx in words) {
        console.log(words[indx], parseDiceRoll(words[indx]));
    }
});

client.login(process.env.DISCORD_TOKEN);