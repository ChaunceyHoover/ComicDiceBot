import { REST, Routes } from 'discord.js';
import { readFile } from 'fs';

const commands = [];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

function registerCommands() {
    console.log('Starting application commands refresh...');

    rest.put(Routes.applicationCommands(process.env.DISCORD_APP_ID), { body: commands })
        .then(() => console.log('Successfully updated commands'))
        .catch(err => {
            console.error('Unable to update commands');
            console.error(err);
        });
}

readFile('commands.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Unable to read `commands.json`');
        console.error(err);
        throw err;
    }

    const obj = JSON.parse(data);
    obj.forEach(cmd => {
        console.log('cmd:', cmd);
    });
    
    registerCommands();
});