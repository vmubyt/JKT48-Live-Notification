const axios = require("axios");
const { WebhookClient, EmbedBuilder } = require("discord.js");
const { getTimes } = require("../utils/getTimes");
const { getMongoClient } = require("../utils/database");
const { bgCyanBright, redBright, green } = require("colorette");
const moment = require('moment-timezone');
require("dotenv").config();

// Daftar username IDN yang akan dimonitor
const idnUsernames = [
  "jkt48_freya",
  "jkt48_ashel",
  "jkt48_amanda",
  "jkt48_gita",
  "jkt48_lulu",
  "jkt48_jessi",
  "jkt48_shani",
  "jkt48_raisha",
  "jkt48_muthe",
  "jkt48_chika",
  "jkt48_christy",
  "jkt48_lia",
  "jkt48_cathy",
  "jkt48_cynthia",
  "jkt48_daisy",
  "jkt48_indira",
  "jkt48_eli",
  "jkt48_michie",
  "jkt48_gracia",
  "jkt48_ella",
  "jkt48_adel",
  "jkt48_feni",
  "jkt48_marsha",
  "jkt48_zee",
  "jkt48_lyn",
  "jkt48_indah",
  "jkt48_elin",
  "jkt48_chelsea",
  "jkt48_danella",
  "jkt48_gendis",
  "jkt48_gracie",
  "jkt48_greesel",
  "jkt48_flora",
  "jkt48_olla",
  "jkt48_kathrina",
  "jkt48_oniel",
  "jkt48_fiony",
  "jkt48_callie",
  "jkt48_alya",
  "jkt48_anindya",
  "jkt48_jeane",
  "jkt48-official",
  "jkt48_aralie",
  "jkt48_delynn",
  "jkt48_shasa",
  "jkt48_lana",
  "jkt48_erine",
  "jkt48_fritzy",
  "jkt48_lily",
  "jkt48_trisha",
  "jkt48_moreen",
  "jkt48_levi",
  "jkt48_nayla",
  "jkt48_nachia",
  "jkt48_oline",
  "jkt48_regie",
  "jkt48_ribka",
  "jkt48_nala",
  "jkt48_kimmy",
  "jkt48_virgi",
  "jkt48_auwia",
  "jkt48_rilly",
  "jkt48_giaa",
  "jkt48_maira",
  "jkt48_ekin",
  "jkt48_jemima",
  "jkt48_mikaela",
  "jkt48_intan"
];

// Inisialisasi webhook client
const webhookClient = new WebhookClient({
  id: process.env.IDN_LIVE_NOTIF_CHANNEL_ID,
  token: process.env.IDN_LIVE_NOTIF_CHANNEL_TOKEN
});

// Fungsi untuk mengirim notifikasi webhook
async function sendWebhookNotification(data) {
  try {
    const link = `https://www.idn.app/${data.user.username}/live/${data.slug}`;

    // Tentukan salam otomatis
    const now = moment().tz('Asia/Jakarta');
    const hour = now.hour();
    let salam = "Selamat malam";
    if (hour >= 4 && hour < 12) salam = "Selamat pagi";
    else if (hour >= 12 && hour < 15) salam = "Selamat siang";
    else if (hour >= 15 && hour < 18) salam = "Selamat sore";

    const description = `${salam}, ${data.user.name} sedang live nih, yuk nonton bareng!`;
    const infoBlock = `\`\`\`\n📌 ${data.title}\n⏰ ${moment.utc(data.live_at).tz('Asia/Jakarta').locale('id').format('dddd, DD MMMM HH:mm')}\n\`\`\``;

    const embed = new EmbedBuilder()
      .setTitle(`${data.user.name.toUpperCase()} SEDANG LIVE IDN NIH!!`)
      .setDescription(description)
      .setImage(data.image)
      .setColor("#58baff")
      .setTimestamp()
      .setFooter({
        text: "Automated by SERVER48 ·",
        iconURL: "https://cdn.discordapp.com/avatars/1379646111840600074/994Vno3rD2EOdto2JfsE0Ug8UfIFbKcXmOEw2eLyk1Zp7zSUz-bdKi1QeaEP53wGM6f1.png"
      });

    embed.addFields(
      {
        name: "",
        value: infoBlock,
        inline: false
      },
      {
        name: "Watch on IDN Live:",
        value: `[Here](${link})`,
        inline: true
      },
      {
        name: "Profile IDN:",
        value: `[Profile](https://www.idn.app/${data.user.username})`,
        inline: true
      }
    );

    // Tambahkan button abu-abu untuk Watch on IDN Live
    const components = [
      {
        type: 1, // ActionRow
        components: [
          {
            type: 2, // Button
            style: 2, // Secondary (abu-abu)
            label: "Watch on IDN Live",
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
    console.log(green(`Member ${data.user.name} is Live Sending notification...`));
  } catch (error) {
    console.error('Error mengirim notifikasi:', error);
  }
}

// Fungsi untuk mendapatkan data live dari IDN
async function getIDNLives() {
  try {
    const response = await axios.post(
      "https://api.idn.app/graphql",
      {
        query: 'query SearchLivestream { searchLivestream(query: "", limit: 100) { next_cursor result { slug title image_url view_count playback_url room_identifier status live_at end_at scheduled_at gift_icon_url category { name slug } creator { uuid username name avatar bio_description following_count follower_count is_follow } } }}'
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data?.data.searchLivestream?.result;
    if (data?.length) {
      const result = data.filter((i) => {
        return idnUsernames.includes(i.creator?.username || "0");
      });
      return result.map((i) => {
        return {
          user: {
            id: i.creator?.uuid,
            name: i.creator?.name,
            username: i.creator?.username,
            avatar: i.creator?.avatar,
          },
          image: i.image_url,
          stream_url: i.playback_url,
          title: i.title,
          slug: i.slug,
          view_count: i.view_count,
          live_at: new Date(i.live_at).toISOString(),
        };
      });
    }
    return [];
  } catch (error) {
    console.error('Error mengambil data live IDN:', error);
    return [];
  }
}

// Fungsi untuk mendapatkan info live dan mengirim notifikasi
async function getLiveInfo(rooms) {
  try {
    const client = await getMongoClient();
    const db = client.db('showroom');
    const collection = db.collection('idn_lives_history');

    for (const member of rooms) {
      const liveId = member.slug;
      const liveDatabase = await collection.find().toArray();
      const liveIds = liveDatabase.map((obj) => obj.live_id);

      if (rooms.length) {
        if (liveIds.includes(liveId)) {
          console.log(redBright(`Already notified for ${member.user.name} live ID ${liveId}`));
        } else {
          await sendWebhookNotification(member);
          await collection.insertOne({
            room_id: member.user.id,
            live_id: member.slug,
            username: member.user.username,
            image: member.user.avatar,
            name: member.user.name,
            date: member.live_at,
          });
        }
      } else {
        console.log(redBright("No one member IDN Lives"));
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
    second: "numeric",
  };
  let formattedDate = now.toLocaleString("id-ID", options);
  return console.log(bgCyanBright(`Live Job Running at ${formattedDate}`));
}

let cronJob;

const IDNLiveNotif = {
  sendDiscordNotif: async (req, res) => {
    try {
      if (cronJob) {
        cronJob?.destroy();
      }

      const idnLives = await getIDNLives();
      await getLiveInfo(idnLives);
      getScheduledJobTime();

      if (idnLives?.length > 0) {
        console.log("IDN Live Notif send to discord");
        res.send({
          message: "IDN Live notification sent!",
          data: idnLives.map(live => live.username)
        });
      } else {
        console.log(redBright("No one member IDN Lives"));
        res.send({
          message: "No one member IDN Lives"
        });
      }
    } catch (error) {
      console.error("Error fetching IDN lives:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  getIDNLives,
  getLiveInfo,
  getScheduledJobTime
};

module.exports = IDNLiveNotif; 