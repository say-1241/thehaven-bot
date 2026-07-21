const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits 
} = require('discord.js');
const http = require('http');

// سيرفر وهمي لـ Render
http.createServer((req, res) => {
    res.write("Bot is alive!");
    res.end();
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

// تعريف الأوامر
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('فحص سرعة البوت'),

    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('عرض الأفاتار')
        .addUserOption(opt => opt.setName('user').setDescription('العضو').setRequired(false)),

    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('مسح الرسائل')
        .addIntegerOption(opt => opt.setName('amount').setDescription('العدد من 1 إلى 100').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
].map(cmd => cmd.toJSON());

client.once('ready', async () => {
    console.log(`✅ البوت متصل: ${client.user.tag}`);
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('🎉 تم تسجيل أوامر السلاش بنجاح!');
    } catch (e) {
        console.error(e);
    }
});

// الاستجابة لأوامر السلاش
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    // أهم خطوة لعدم ظهور خطأ The application did not respond
    await interaction.deferReply({ ephemeral: true }).catch(() => {});

    const { commandName } = interaction;

    if (commandName === 'ping') {
        return interaction.editReply(`🏓 بونج! السرعة: **${client.ws.ping}ms**`);
    }

    if (commandName === 'avatar') {
        const user = interaction.options.getUser('user') || interaction.user;
        const embed = new EmbedBuilder()
            .setTitle(`🖼️ صورة ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor('#5865F2');

        return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'clear') {
        const amount = interaction.options.getInteger('amount');
        if (amount < 1 || amount > 100) {
            return interaction.editReply('⚠️ اكتب رقم من 1 إلى 100.');
        }

        await interaction.channel.bulkDelete(amount, true);
        return interaction.editReply(`🧹 تم مسح **${amount}** رسالة بنجاح.`);
    }
});

client.login(process.env.TOKEN);
