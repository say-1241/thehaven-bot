const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const http = require('http');

// 1. سيرفر وهمي لمنع Render من إيقاف البوت
http.createServer((req, res) => {
    res.write("Bot is alive!");
    res.end();
}).listen(process.env.PORT || 3000);

// 2. إعداد البوت
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once('ready', () => {
    console.log(`✅ البوت شغال وجاهز 100%: ${client.user.tag}`);
});

// 3. الاستماع للأوامر العادية
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const content = message.content.trim();

    // فحص الاستجابة
    if (content === '!ping' || content === '!تجربة') {
        return message.reply('🏓 بونج! البوت شغال وجاهز!');
    }

    // أمر الأفاتار
    if (content.startsWith('!avatar') || content.startsWith('!افتار')) {
        const user = message.mentions.users.first() || message.author;
        const embed = new EmbedBuilder()
            .setTitle(`🖼️ صورة ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor('#5865F2');

        return message.reply({ embeds: [embed] });
    }

    // أمر معلومات الحساب
    if (content.startsWith('!user') || content.startsWith('!يوزر')) {
        const member = message.mentions.members.first() || message.member;
        const embed = new EmbedBuilder()
            .setTitle(`👤 معلومات: ${member.user.username}`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'الاسم:', value: `${member.user.tag}`, inline: true },
                { name: 'الآيدي:', value: `${member.id}`, inline: true },
                { name: 'تاريخ الإنشاء:', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: false }
            )
            .setColor('#00FF7F');

        return message.reply({ embeds: [embed] });
    }

    // أمر مسح الشات
    if (content.startsWith('!clear') || content.startsWith('!مسح')) {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ ما عندك صلاحية مسح الرسائل!');
        }

        const args = content.split(' ');
        const amount = parseInt(args[1]);

        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('⚠️ اكتب رقم من 1 إلى 100، مثال: `!مسح 10`');
        }

        await message.channel.bulkDelete(amount, true);
        const msg = await message.channel.send(`🧹 تم مسح **${amount}** رسالة.`);
        setTimeout(() => msg.delete().catch(() => {}), 3000);
    }
});

client.login(process.env.TOKEN);
