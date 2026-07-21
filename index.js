const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');

// 1. إنشاء العميل وتحديد الصلاحيات المطلوب الاستماع لها
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates, // للتحكم بالصوت
        GatewayIntentBits.GuildMessages,    // لقراءة الرسائل
        GatewayIntentBits.MessageContent   // لقراءة نص الأمر
    ]
});

// 2. إعداد مشغل الموسيقى
const player = new Player(client);

// تحميل المشغلات للبحث في المنصات (مثل سبوتيفاي، يوتيوب، إلخ)
async function initPlayer() {
    await player.extractors.loadMulti(DefaultExtractors);
}
initPlayer();

client.once('ready', () => {
    console.log(`🤖 البوت جاهز وشغال باسم: ${client.user.tag}`);
});

// 3. الأوامر الصوتية
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // امر التشغيل: !play
    if (message.content.startsWith('!play')) {
        const query = message.content.replace('!play', '').trim();
        const channel = message.member.voice.channel;

        if (!channel) return message.reply('❌ لازم تكون موجود في روم صوتي أولاً!');
        if (!query) return message.reply('❓ اكتب اسم الأغنية أو الرابط بعد الأمر، مثال: `!play song name`');

        try {
            const replyMsg = await message.reply(`🔎 جاري البحث عن: **${query}**...`);

            const { track } = await player.play(channel, query, {
                nodeOptions: {
                    metadata: message
                }
            });

            return replyMsg.edit(`🎶 تم التشغيل بنجاح: **${track.title}**`);
        } catch (e) {
            console.error(e);
            return message.reply('❌ حدثت مشكلة أثناء محاولة تشغيل المقطع!');
        }
    }

    // أمر الإيقاف والخروج: !stop
    if (message.content === '!stop') {
        const queue = player.nodes.get(message.guild.id);
        if (!queue) return message.reply('ما فيه شيء شغال حالياً!');

        queue.delete();
        return message.reply('🛑 تم إيقاف التشغيل وإخلاء الروم الصوتي.');
    }
});

// تسجيل الدخول باستخدام التوكن المربوط في Render
client.login(process.env.TOKEN);
