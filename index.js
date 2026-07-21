const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', async () => {
  console.log(`${client.user.tag} is online!`);

  client.user.setPresence({
    activities: [
      {
        name: 'The Haven',
        type: ActivityType.Watching,
      },
    ],
    status: 'online',
  });

  const guild = client.guilds.cache.get('1077215115247636591');

  if (!guild) return console.log('السيرفر غير موجود');

  joinVoiceChannel({
    channelId: '1200894234320965785',
    guildId: '1077215115247636591',
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: false,
  });

  console.log('دخلت الروم الصوتي');
});

client.login(process.env.TOKEN);
