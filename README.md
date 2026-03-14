<p align="center">
<img src="html/dist/img/kasirku.png" width="128" height="128" alt="KasirKu Logo">
</p>

<h1 align="center">KasirKu</h1>

<p align="center">
<strong>Simple & Efficient Point of Sale (PoS) System</strong>
</p>

<p align="center">
<img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun">
<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</p>
<hr>

**KasirKu** adalah aplikasi **Point of Sale (PoS)** yang dibuat untuk membantu pemilik usaha mengelola transaksi kasir dengan lebih mudah.

## Cara Menjalankan
### Pakai Bun

Pastikan [Bun](https://bun.sh) sudah terinstall.

```
bun install
bun run index.ts
```

### Pakai Docker

```bash
docker build -t kasirku .
docker run -d -p 80:80 -p 443:443 kasirku
```

Jika mau pakai volume:

```bash
docker run -d -p 80:80 -p 443:443 \
  -v kasirku-db:/app/database \
  -v kasirku-cert:/app/cert \
  -v kasirku-profile:/app/html/profile_img \
  kasirku
```

### Akses

Buka `https://localhost` di browser. Login default: `admin` / `admin`.

# Credit
- Icon Cash Register by [Kameleon (icon-icons.com)](https://icon-icons.com/icon/cashier-cash-register/118071)
- NProgress by [rstacruz](https://github.com/rstacruz/nprogress)