const { WebhookClient, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { getTimes } = require('../utils/getTimes');
const { getMongoClient } = require('../utils/database');
const { bgCyanBright, redBright, green } = require("colorette");
const moment = require("moment-timezone");
const cron = require("node-cron");
require('dotenv').config();

// Inisialisasi webhook client
const webhookClient = new WebhookClient({ 
  id: process.env.LIVE_SHOWROOM_ID,
  token: process.env.LIVE_SHOWROOM_TOKEN
});

// Fungsi untuk mengirim notifikasi webhook
async function sendWebhookNotification(data, liveTime) {
  try {
    const name = data.room_url_key === "shani_indira" ? "Ci Shani JOT48" : data.room_url_key.replace("JKT48_", "");
    const title = `${name.toUpperCase()} SEDANG LIVE SHOWROOM NIH!!`;
    const image = data.image?.replace("_s.jpeg", "_l.jpeg");
    const link = `https://www.showroom-live.com/r/${data.room_url_key}`;

    // Tentukan salam otomatis
    const now = moment().tz('Asia/Jakarta');
    const hour = now.hour();
    let salam = "Selamat malam";
    if (hour >= 4 && hour < 12) salam = "Selamat pagi";
    else if (hour >= 12 && hour < 15) salam = "Selamat siang";
    else if (hour >= 15 && hour < 18) salam = "Selamat sore";

    const description = `${salam}, ${name} sedang live nih, yuk nonton bareng!`;
    const infoBlock = `\`\`\`\n📌 ${title}\n⏰ ${getTimes(liveTime, true)}\n\`\`\``;

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setImage(image)
      .setColor("#58baff")
      .setTimestamp()
      .setFooter({
        text: "Automated by SERVER48 ·",
        iconURL: "https://cdn.discordapp.com/avatars/1379645723951370291/ZEBvNUfusz9-4D4bBCtPcO1MuRhnSM1n0NgEVSeuGwv2081VPD302EI2-bEHMPa_cWMu.png"
      });

    embed.addFields(
      {
        name: "",
        value: infoBlock,
        inline: false
      },
      {
        name: "Watch on Showroom:",
        value: `[Here](${link})`,
        inline: true
      },
      {
        name: "Profile Showroom:",
        value: `[Profile](https://www.showroom-live.com/room/profile?room_id=${data.room_id})`,
        inline: true
      }
    );

    // Tambahkan button abu-abu untuk Watch on Showroom
    const components = [
      {
        type: 1, // ActionRow
        components: [
          {
            type: 2, // Button
            style: 2, // Secondary (abu-abu)
            label: "Watch on Showroom",
            url: link,
            disabled: false,
            emoji: undefined,
            custom_id: undefined
          }
        ]
      }
    ];

    await webhookClient.send({
      embeds: [embed],
      components
    });
    console.log(green(`Member ${name} is Live Sending notification...`));
  } catch (error) {
    console.error('Error mengirim notifikasi:', error);
  }
}

// Fungsi untuk mendapatkan data live dari Showroom
async function getMemberLiveData() {
  try {
    const response = await axios.get('https://www.showroom-live.com/api/live/onlives');
    const data = response.data.onlives;
    let roomLives = [];

    if (data.length) {
      data.forEach((batch) => {
        batch.lives.forEach((item) => {
          if (
            item.room_url_key &&
            (item.room_url_key.includes("JKT48") || item.room_url_key.includes("shani_indira"))
          ) {
            roomLives.push(item);
          }
        });
      });
    }

    return roomLives;
  } catch (error) {
    console.error('Error mengambil data live:', error);
    return [];
  }
}

// Fungsi untuk mendapatkan info live dan mengirim notifikasi
async function getLiveInfo(rooms) {
  try {
    const client = await getMongoClient();
    const db = client.db('showroom');
    const collection = db.collection('live_ids');

    for (const member of rooms) {
      const liveTime = member.started_at;
      const liveId = member.live_id;
      const liveDatabase = await collection.find().toArray();
      const liveIds = liveDatabase.map((obj) => obj.live_id);
      const indoDate = moment.unix(liveTime).tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');

      const name = member.room_url_key === "shani_indira" ? "Shani JOT48" : member.room_url_key.replace("JKT48_", "") + " JKT48";

      if (rooms.length) {
        if (liveIds.includes(liveId)) {
          console.log(redBright(`Already notified for ${name} live ID ${liveId}`));
        } else {
          await sendWebhookNotification(member, liveTime);
          await collection.insertOne({
            roomId: member.room_id ?? member.id,
            name,
            live_id: liveId,
            date: indoDate
          });
        }
      } else {
        console.log(redBright("No one member lives"));
      }
    }
  } catch (error) {
    console.error('Error dalam getLiveInfo:', error);
  }
}

function getScheduledJobTime() {
  let now = new Date();
  let options = {
    timeZone: "Asia/Jakarta",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric"
  };
  let formattedDate = now.toLocaleString("id-ID", options);
  return console.log(bgCyanBright(`Live Job Running at ${formattedDate}`));
}

let cronJob;

const DiscordApi = {
  getLiveNotification: async (req, res) => {
    try {
      if (cronJob) {
        cronJob?.destroy();
      }

      const roomLives = await getMemberLiveData();
      
      cronJob = cron.schedule("*/30 * * * * *", async () => {
        const roomLives = await getMemberLiveData();
        await getLiveInfo(roomLives);
        getScheduledJobTime();
      });

      if (roomLives?.length > 0) {
        const roomNameData = roomLives.map((member) => member.main_name);
        res.send({
          message: "Live notification sent!",
          data: roomNameData
        });
      } else {
        res.send({
          message: "No one member lives"
        });
        console.log(redBright("No one member lives"));
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Error sending live notification");
    }
  },
  getMemberLiveData,
  getLiveInfo,
  getScheduledJobTime
};

module.exports = DiscordApi; 