const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();

// 1. WEB SERVER (Keeps Render/Cloud alive)
const port = process.env.PORT || 8080;
app.get('/', (req, res) => res.send('Bot is Running 24/7!'));
app.listen(port, () => console.log(`Server running on port ${port}`));

// 2. BOT CLIENT SETUP
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        executablePath: '/usr/bin/google-chrome-stable' // For Render Linux
    }
});

// 3. QR CODE GENERATOR
client.on('qr', (qr) => {
    console.log('--- SCAN THE QR CODE BELOW ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Success! Bot is online and ready!');
});

// 4. COMMAND LOGIC
client.on('message', async (message) => {
    const msg = message.body.trim().toLowerCase();

    // Command: .ping
    if (msg === '.ping') {
        message.reply('pong! 🏓');
    }

    // Command: .sticker
    if (msg === '.sticker' && message.hasMedia) {
        const media = await message.downloadMedia();
        message.reply(media, null, { sendMediaAsSticker: true });
    }

    // Command: .mp3 (Video to Audio)
    if (msg === '.mp3' && message.hasMedia) {
        const media = await message.downloadMedia();
        if (!media.mimetype.includes('video')) {
            return message.reply("❌ Please send me a VIDEO to convert!");
        }
        
        await message.reply("⏳ Genius at work... converting to MP3 (Max 20s)");
        
        await client.sendMessage(message.from, media, {
            sendMediaAsDocument: true,
            fileName: 'audio.mp3',
            ffmpegArgs: ['-t', '00:00:20', '-vn', '-acodec', 'libmp3lame']
        });
    }
});

client.initialize();
