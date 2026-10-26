import express from 'express';
import nodemailer from 'nodemailer';

const app = express();
app.use(express.json());

// Konfigurasi transporter email (Gmail SMTP)
// Gunakan Environment Variables di Vercel untuk kredensial
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Middleware sederhana untuk validasi key (opsional)
app.use((req, res, next) => {
    // Ganti dengan key yang kamu inginkan
    if (req.path !== '/' && req.headers['x-manzx-key'] !== 'MANZX_super_rahasia_123') {
        return res.status(403).json({ status: 'error', msg: 'Unauthorized' });
    }
    next();
});

// Endpoint 1: Cek Email (sebelumnya /x/v1/check)
app.post('/x/v1/check', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ status: 'error', msg: 'Email kosong' });
  // Di sini kamu bisa tambahkan logika validasi email
  res.json({ status: 'success', msg: 'OK' });
});

// Endpoint 2: Kirim Link Verifikasi (sebelumnya /api/request)
app.post('/api/request', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ status: 'error', msg: 'Email tidak ditemukan' });

  // Buat link verifikasi (contoh sederhana, bisa pakai token unik)
  const verificationLink = `https://manzx.vercel.app/verify?email=${encodeURIComponent(email)}`;

  try {
    await transporter.sendMail({
      from: `"MANZX" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verifikasi Premium MANZX',
      html: `<p>Klik link berikut untuk verifikasi:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
    });
    res.json({ status: 'success', msg: 'Link verifikasi sudah dikirim ke email kamu.' });
  } catch (err) {
    console.error('Email error:', err);
    res.status(500).json({ status: 'error', msg: 'Gagal mengirim email.' });
  }
});

// Endpoint 3: Verifikasi Link (sebelumnya /api/verify)
app.post('/api/verify', (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ status: 'error', msg: 'Link kosong' });
  // Di sini kamu bisa validasi token/link yang dikirim
  res.json({ status: 'success', msg: 'Aktivasi Premium berhasil!' });
});

// Health check (opsional)
app.get('/', (req, res) => {
  res.json({ status: 'success', msg: 'MANZX Backend is running' });
});

// WAJIB untuk Vercel: export default app
export default app;
