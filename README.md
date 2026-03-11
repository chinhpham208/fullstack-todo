# 📝 Fullstack Todo App

Ứng dụng quản lý công việc cá nhân. Xây dựng với React + Node.js + MongoDB.

## 🛠️ Tech Stack

- **Frontend:** React + Vite + React Router + Axios
- **Backend:** Node.js + Express + JWT Auth
- **Database:** MongoDB Atlas
- **Deploy:** Vercel (frontend) + Render (backend)

---

## 🚀 Chạy Local

### 1. Clone repo
```bash
git clone https://github.com/USERNAME/fullstack-todo.git
cd fullstack-todo
```

### 2. Chạy Backend
```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend/`:
```
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.scoz1sx.mongodb.net/todoapp?appName=Cluster0
JWT_SECRET=bat_ky_chuoi_nao_kho_doan
PORT=3000
```

```bash
npm run dev
# Server chạy tại http://localhost:3000
```

### 3. Chạy Frontend
```bash
cd frontend
npm install
npm run dev
# App chạy tại http://localhost:5173
```

---

## 🌍 Deploy

### Backend → Render.com
1. Vào render.com → New Web Service → Connect GitHub
2. Chọn repo này, thư mục `backend`
3. Build Command: `npm install`
4. Start Command: `node app.js`
5. Thêm Environment Variables:
   - `MONGODB_URI` = connection string MongoDB của bạn
   - `JWT_SECRET` = chuỗi bí mật bất kỳ
   - `PORT` = 3000
6. Deploy → copy URL dạng `https://ten-app.onrender.com`

### Frontend → Vercel.com
1. Vào vercel.com → New Project → Import GitHub repo
2. Root Directory: `frontend`
3. Thêm Environment Variable:
   - `VITE_API_URL` = URL Render vừa copy
4. Deploy!

### Giữ Server Render Không Ngủ (Free Tier)
1. Vào cron-job.org → Tạo tài khoản miễn phí
2. Tạo cronjob ping URL: `https://ten-app.onrender.com/ping`
3. Đặt thời gian: mỗi 10 phút
→ Server sẽ không bị tắt!

---

## 📁 Cấu Trúc

```
fullstack-todo/
├── backend/
│   ├── models/       # User.js, Todo.js
│   ├── routes/       # authRoutes.js, todoRoutes.js
│   ├── middleware/   # xacThuc.js
│   ├── .env          # Biến môi trường (không push GitHub!)
│   └── app.js
└── frontend/
    ├── src/
    │   ├── pages/    # DangNhap, DangKy, TrangChu
    │   ├── api.js    # Axios config
    │   └── App.jsx
    └── index.html
```
