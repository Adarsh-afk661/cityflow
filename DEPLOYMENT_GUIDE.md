# CityFlow Simple Cloud Deployment Guide (Vercel + Render + MongoDB)

Yeh guide CityFlow ko **Vercel (Frontend)** aur **Render (Backend + MongoDB Atlas)** par deploy karne ka sabse asan aur clean tarika batata hai.

---

## Step 1: Free MongoDB Atlas Database (2 Minutes)

Agar aapke paas MongoDB nahi hai, toh Atlas par 100% free cloud database banayein:

1. [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) par jayein aur free account banayein.
2. **Create a Deployment** -> **M0 (Free Shared)** select karein.
3. **Database User**:
   - Username: `cityflow_admin`
   - Password: (apna password banayein, e.g. `CityFlow2026!`)
4. **Network Access**:
   - IP Access List mein **Allow Access from Anywhere (`0.0.0.0/0`)** add karein.
5. **Connect** -> **Drivers (Node.js)** par click karke connection string copy karein:
   ```
   mongodb+srv://cityflow_admin:<password>@cluster0.abcde.mongodb.net/cityflow?retryWrites=true&w=majority
   ```
   *(Apna actual password `<password>` ki jagah daal dein).*

---

## Step 2: Backend Deploy Karein Render.com Par (100% Free)

1. Apne project code ko GitHub repository mein push karein.
2. [render.com](https://render.com) par free account banayein aur **New +** -> **Web Service** par click karein.
3. Apne GitHub repository ko select karein.
4. Settings fill karein:
   - **Name**: `cityflow-backend`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Environment Variables** section mein add karein:
   - Key: `MONGODB_URI`
   - Value: *(Step 1 wali aapki MongoDB Atlas connection string)*
   - Key: `NODE_ENV`
   - Value: `production`
6. Click **Deploy Web Service**!
7. 2 minute mein aapka backend live ho jayega aur Render aapko ek URL dega:
   👉 `https://cityflow-backend-xxxx.onrender.com`

---

## Step 3: Frontend Deploy Karein Vercel Par (100% Free & Super Fast)

1. [vercel.com](https://vercel.com) par login karein aur **Add New...** -> **Project** select karein.
2. Apna GitHub repository import karein.
3. Framework automatically **Vite** detect ho jayega.
4. **Environment Variables** section expand karein aur add karein:
   - Key: `VITE_API_URL`
   - Value: `https://cityflow-backend-xxxx.onrender.com` *(Step 2 wala Render backend URL)*
5. Click **Deploy**!
6. Vercel aapko live frontend link de dega:
   👉 `https://cityflow-app.vercel.app`

---

## Step 4: Real Data Seed Karna (1-Click)

Jab aapka frontend live open ho jaye:
1. App mein **Settings** page par jayein.
2. **"MongoDB Atlas Database"** card mein **"Seed Real Fleet & Corridor Data"** button dabayein.
3. Bas! Saari real commercial vehicle classes, real bridge clearances, corridors, aur live telemetry seedhi aapke MongoDB Atlas database mein insert ho jayengi!

---

## Local Machine Par Run Karna

Agar local test karna ho:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser!
