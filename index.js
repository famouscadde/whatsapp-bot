const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();

// 1. WEB SERVER (This MUST be defined before it is used)
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
    res.send('Bot is Running 24/7!');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});

// 2. BOT CLIENT SETUP
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-dev-shm-usage'
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
    }
}); // Fixed the missing bracket here!

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
        try {
            const media = await message.downloadMedia();
            message.reply(media, null, { sendMediaAsSticker: true });
        } catch (err) {
            console.log("Sticker Error:", err);
        }
    }

    // Command: .mp3 (Video to Audio)
    if (msg === '.mp3' && message.hasMedia) {
        const media = await message.downloadMedia();
        if (!media.mimetype.includes('video')) {
            return message.reply("❌ Please send me a VIDEO to convert!");
        }
        
        await message.reply("⏳ Genius at work... converting to MP3 (Max 20s)");
        
        try {
            await client.sendMessage(message.from, media, {
                sendMediaAsDocument: true,
                fileName: 'audio.mp3',
                ffmpegArgs: ['-t', '00:00:20', '-vn', '-acodec', 'libmp3lame']
            });
        } catch (err) {
            console.log("MP3 Error:", err);
            message.reply("❌ Conversion failed. Make sure the video is short!");
        }
    }
});

client.initialize();
