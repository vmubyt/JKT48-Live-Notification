# JKT48 Live Notifier Discord Bot

Bot notifikasi live JKT48 untuk Showroom dan IDN.

## Fitur

- Notifikasi live Showroom
- Notifikasi live IDN
- Pencegahan notifikasi duplikat
- Format waktu WIB
- Embed message yang informatif
- Link langsung ke stream

## Instalasi

1. Clone repository ini
2. Install dependencies:
```bash
npm install
```

3. Buat file `.env` dengan isi:
```env
MONGO_DB=your_mongodb_connection
LIVE_SHOWROOM_ID=your_webhook_id
LIVE_SHOWROOM_TOKEN=your_webhook_token
IDN_LIVE_NOTIF_CHANNEL_ID=your_webhook_id
IDN_LIVE_NOTIF_CHANNEL_TOKEN=your_webhook_token
JKT48_SHOWROOM_WEB=https://www.jkt48showroom.com
```

4. Jalankan bot:
```bash
npm start
```

## Endpoint

- `GET /notification` - Cek Showroom live
- `GET /idn-notification` - Cek IDN live

## Mekanisme

1. Bot akan mengecek live status setiap 30 detik
2. Jika ada member yang live:
   - Cek apakah sudah pernah di-notifikasi (menggunakan live_id)
   - Jika belum, kirim notifikasi ke Discord
   - Simpan data ke database
3. Jika member sudah off stream, data tetap tersimpan di database untuk mencegah notifikasi duplikat

## Database Structure

```javascript
// Collection: live_ids (Showroom)
{
  roomId: String,
  name: String,
  live_id: String,
  date: Date
}

// Collection: idn_lives_history (IDN)
{
  room_id: String,
  live_id: String,
  username: String,
  image: String,
  name: String,
  date: Date
}
``` 
