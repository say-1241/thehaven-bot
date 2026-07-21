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

// 1. خادوم وهمي لـ Render (Port Binding)
http.createServer((req, res) => {
    res.write("Bot is alive!");
    res.end();
}).listen(process.env.PORT || 3000);

// 2. إنشاء العميل
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers
    ]
});

// 3. تعريف أوامر السلاش (Slash Commands Definition)
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('فحص استجابة وسرعة البوت'),

    new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('عرض صورتك الشخصية أو صورة عضو آخر')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('العضو المراد عرض صورته')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('user')
        .setDescription('عرض معلومات الحساب الشخصي')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('العضو المراد عرض معلوماته')
                .setRequired(false)
        ),

    new SlashCommandBuilder()
        .setName('clear')
        .setDescription('مسح عدد معين من الرسائل في الروم')
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('عدد الرسائل المراد مسحها (1-100)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
].map(command => command.toJSON());

// 4. تسجيل الأوامر عند تشغيل البوت
client.once('ready', async () => {
    console.log(`✅ البوت متصل الآن باسم: ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('🔄 جاري تسجيل أوامر السلاش (Slash Commands)...');
        
        // تسجيل الأوامر عالمياً على مستوى كل السيرفرات
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        console.log('🎉 تم تسجيل جميع أوامر السلاش بنجاح!');
    } catch (error) {
        console.error('❌ حدث خطأ أثناء تسجيل الأوامر:', error);
    }
});

// 5. الاستجابة للتفاعل مع الأوامر (Interaction Create)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    // أمر /ping
    if (commandName === 'ping') {
        return interaction.reply({ content: `🏓 بونج! سرعة الاستجابة: **${client.ws.ping}ms**`, ephemeral: true });
    }

    // أمر /avatar
    if (commandName === 'avatar') {
        const user = interaction.options.getUser('user') || interaction.user;
        const avatarUrl = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setTitle(`🖼️ صورة ${user.username}`)
            .setImage(avatarUrl)
            .setColor('#5865F2');

        return interaction.reply({ embeds: [embed] });
    }

    // أمر /user
    if (commandName === 'user') {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(targetUser.id);

        const embed = new EmbedBuilder()
            .setTitle(`👤 معلومات: ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: 'الاسم:', value: `${targetUser.tag}`, inline: true },
                { name: 'الآيدي:', value: `${targetUser.id}`, inline: true },
                { name: 'تاريخ انضمام السيرفر:', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: false },
                { name: 'تاريخ إنشاء الحساب:', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: false }
            )
            .setColor('#00FF7F');

        return interaction.reply({ embeds: [embed] });
    }

    // أمر /clear
    if (commandName === 'clear') {
        const amount = interaction.options.getInteger('amount');

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: '⚠️ يرجى إدخال رقم بين 1 و 100.', ephemeral: true });
        }

        await interaction.channel.bulkDelete(amount, true);
        await interaction.reply({ content: `🧹 تم مسح **${amount}** رسالة بنجاح.`, ephemeral: true });
    }
});

// تسجيل الدخول
client.login(process.env.TOKEN);
