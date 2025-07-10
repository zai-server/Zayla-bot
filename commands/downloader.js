const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'downloader',
  description: 'Unduh video dari YouTube',
  async execute(client, message, arg) {
    if (!arg || !arg.includes('youtube')) {
      return client.sendMessage(message.from, '❗ Format: .downloader [link youtube]');
    }

    const info = await ytdl.getInfo(arg);
    const fileName = path.resolve(__dirname, `../temp/${Date.now()}.mp4`);

    client.sendMessage(message.from, '⏳ Mendownload...');

    ytdl(arg, { quality: 'lowest' })
      .pipe(fs.createWriteStream(fileName))
      .on('finish', async () => {
        await client.sendMessage(message.from, fs.readFileSync(fileName), {
          sendMediaAsDocument: true,
          caption: `🎞️ ${info.videoDetails.title}`
        });
        fs.unlinkSync(fileName);
      });
  }
};
