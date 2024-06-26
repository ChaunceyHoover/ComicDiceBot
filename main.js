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
    let replyMsg = "";

    for (const indx in words) {
        let parsedResults = parseDiceRoll(words[indx]);
        console.log(parsedResults);
        if (parsedResults == null) continue;

        for (const indx in parsedResults) {
            const result = parsedResults[indx];
            replyMsg += `\` ${result.result + (result.staticModifier ?? 0)} \` ⟵ [${result.rolls.join(", ")}] ${result.input}\n`;
        }
    }

    await message.channel.send(replyMsg);
});

client.login(process.env.DISCORD_TOKEN);