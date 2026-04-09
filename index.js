const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
   puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-extensions'
            ],
            executablePath: '/usr/bin/google-chrome-stable'
        }

// --- EVENT LISTENERS ---

client.on('qr', (qr) => {
    console.log('SCAN THIS QR CODE WITH WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot is online and ready!');
});

client.on('message', async (message) => {
    const msg = message.body.trim().toLowerCase();

    // 1. PING
    if (msg === '.ping') {
        await message.reply('pong 🏓');
    }

    // 2. OWNER
    if (msg === '.owner') {
        await message.reply('Owner: Hamza');
    }

    // 3. HELP (Formatted as a list)
    if (msg === '.help') {
        const helpMenu = [
            "*Available Commands:*",
            "• .sticker",
            "• .ping",
            "• .owner",
            "• .help"
        ].join('\n');
        
        await message.reply(helpMenu);
    }

    // 4. STICKER (No Watermark/Author + 3-Second Trim)
    if (msg === '.sticker') {
        if (message.hasMedia) {
            try {
                console.log('Processing sticker...');
                const media = await message.downloadMedia();

                await client.sendMessage(message.from, media, {
                    sendMediaAsSticker: true,
                    // Removing author/name removes the "watermark" metadata
                    ffmpegArgs: [
                        '-t', '00:00:03', 
                        '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
                        '-preset', 'ultrafast',
                        '-loop', '0'
                    ]
                });
                console.log('✅ Sticker sent!');
            } catch (err) {
                console.error("Sticker Error:", err);
                await message.reply("Failed to create sticker. Check if the file is compatible.");
            }
        } else {
            await message.reply("Please reply to a video/image with .sticker");
        }
    }
});

client.initialize();
