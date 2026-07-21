const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const http = require('http');

// 1. سيرفر وهمي لمنع Render من إيقاف البوت
http.createServer((req, res) => {
    res.write("Bot is alive!");
    res.end();
}).listen(process.env.PORT || 3000);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const PREFIX = '!'; // تقدر تغير البداية لأي رمز تحبه

client.once('ready', () => {
    console.log(`🤖 البوت أونلاين وجاهز: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // 🖼️ أمر الأفاتار (!avatar)
    if (command === 'avatar' || command === 'افتار') {
        const user = message.mentions.users.first() || message.author;
        const avatarEmbed = new EmbedBuilder()
            .setTitle(`🖼️ صورة ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor('#5865F2');

        return message.reply({ embeds: [avatarEmbed] });
    }

    // 👤 أمر معلومات الحساب (!user)
    if (command === 'user' || command === 'يوزر') {
        const member = message.mentions.members.first() || message.member;
        const userEmbed = new EmbedBuilder()
            .setTitle(`👤 معلومات: ${member.user.username}`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'الاسم الكامل:', value: `${member.user.tag}`, inline: true },
                { name: 'الآيدي (ID):', value: `${member.id}`, inline: true },
                { name: 'تاريخ انضمام السيرفر:', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: false },
                { name: 'تاريخ إنشاء الحساب:', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: false }
            )
            .setColor('#00FF7F');

        return message.reply({ embeds: [userEmbed] });
    }

    // 🏰 أمر معلومات السيرفر (!server)
    if (command === 'server' || command === 'سيرفر') {
        const { guild } = message;
        const serverEmbed = new EmbedBuilder()
            .setTitle(`🏰 معلومات سيرفر: ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: 'صاحب السيرفر:', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'عدد الأعضاء:', value: `${guild.memberCount}`, inline: true },
                { name: 'تاريخ الإنشاء:', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: false }
            )
            .setColor('#FFD700');

        return message.reply({ embeds: [serverEmbed] });
    }

    // 🧹 أمر مسح الشات (!clear 10)
    if (command === 'clear' || command === 'مسح') {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
            return message.reply('❌ ما عندك صلاحية مسح الرسائل!');
        }

        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount < 1 || amount > 100) {
            return message.reply('⚠️ اكتب رقم من 1 إلى 100 (مثال: `!clear 10`)');
        }

        await message.channel.bulkDelete(amount, true);
        const msg = await message.channel.send(`✅ تم مسح **${amount}** رسالة بنجاح.`);
        setTimeout(() => msg.delete(), 3000); // يحذف رسالة التأكيد بعد 3 ثواني
    }

    // 📢 أمر كرر الكلام (!say)
    if (command === 'say' || command === 'قول') {
        const text = args.join(' ');
        if (!text) return message.reply('اكتب الكلام اللي تبي البوت يقوله!');
        
        message.delete(); // يحذف أمر العضو
        return message.channel.send(text);
    }
});

client.login(process.env.TOKEN);
