# 🛍️ MERN E-Commerce Platform (In-Development)
⭐ If you like this project, give it a star on GitHub!
Contributing is highly encouraged

A modern and fully functional **eCommerce website** built using the **MERN stack (MongoDB, Express, React, Node.js)**.  
Developed by **Kirubel Mesfin**, this project delivers a seamless shopping experience with authentication, product management, image uploads, and order tracking.

---

## 🚀 Features

- 🧩 **Full Authentication System** — Secure user signup and login using hashed passwords.  
- 🛒 **Product Management** — Add, edit, delete, and view products with images uploaded to Cloudinary.  
- 📦 **Cart & Order System** — Customers can add items to their cart and place real orders.  
- 🔒 **Admin Dashboard** — Manage users, products, and orders with ease.  
- 💾 **MongoDB Integration** — Stores all data including users, products, and orders.  
- ⚡ **Responsive Frontend** — Built with modern UI and smooth functionality.  
- ☁️ **Cloudinary Integration** — Upload and serve product images from the cloud.  
- 🌐 **Deployed with Render & MongoDB Atlas** (optional).  

---

## 🧰 Tech Stack

**Frontend:** React, HTML, CSS, JavaScript  
**Backend:** Node.js, Express.js  
**Database:** MongoDB (Atlas)  
**Image Storage:** Cloudinary  
**Other Tools:** bcrypt, multer, dotenv, nodemon  

---

## ⚙️ Installation & Setup

1. **Clone this repository**
   ```bash
   git clone https://github.com/kirubelm1/MERN-Ecommerce.git
   cd MERN-Ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### 3. Set up your environment variables

Create a `.env` file in the root folder and add:

```env
# Server configuration
PORT=5000

# MongoDB connection string
MONGODB_URI=replace_with_your_credentials

# JWT secret key
JWT_SECRET=replace_with_your_credentials
# NOTE: Replace with a strong secret in production.

# Authentication settings
# Set to 'true' to disable auth checks for local development/testing. Do NOT enable in production.
DISABLE_AUTH=true

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=replace_with_your_credentials
CLOUDINARY_API_KEY=replace_with_your_credentials
CLOUDINARY_API_SECRET=replace_with_your_credentials
CLOUDINARY_URL=replace_with_your_credentials

# Initial admin credentials for seeding (used on first run only)
# Set a real admin email and a strong password before enabling seeding.
ADMIN_EMAIL=replace_with_your_credentials
ADMIN_PASSWORD=replace_with_your_credentials

# Disable automatic seeding after the first successful run to avoid duplicates
SEED_ADMIN=false


4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Visit your app**
   Open your browser and go to `http://localhost:3000`

---

## 📁 Folder Structure

```
project/
├── app/                                (Next.js Backend)
│   ├── admin/
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── cart/
│   │   └── page.tsx
│   ├── checkout/
│   │   └── page.tsx
│   ├── orders/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── products/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── wishlist/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── backend/                            (Express.js Server)
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── models/
│   │   ├── Order.js
│   │   ├── Product.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── orderRoutes.js
│   │   └── productRoutes.js
│   ├── package.json
│   └── server.js
│
├── frontend/                           (React/Vite Frontend)
│   ├── src/
│   │   ├── assets/
│   │   │   └── image.png
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ui/
│   │   │       └── Button.tsx
│   │   ├── config/
│   │   │   └── api.ts
│   │   ├── pages/
│   │   │   ├── Admin.tsx
│   │   │   ├── AdminOrders.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Orders.tsx
│   │   │   ├── Products.tsx
│   │   │   └── Register.tsx
│   │   ├── store/
│   │   │   ├── authStore.ts
│   │   │   └── cartStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── custom.d.ts
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
├── components/                         (shadcn/ui Components - Next.js)
│   ├── ui/                            (30+ UI components)
│   ├── navbar.tsx
│   └── theme-provider.tsx
│
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── lib/
│   ├── api.ts
│   ├── store.ts
│   └── utils.ts
│
├── public/                            (Static Assets)
│   ├── images/
│   ├── icons/
│   └── various .svg, .png files
│
├── styles/
│   └── globals.css
│
├── package.json
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
└── components.json
```
Run

Run the application
Backend:
```
cd backend
npm install
npm run dev
```
Frontend:
```
cd frontend
npm install
npm run dev
```
---

## 🌍 Deployment

You can deploy the backend easily on **Render** and connect it to **MongoDB Atlas**.  
Make sure to set all environment variables in the Render dashboard.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to fork this project and submit pull requests.

---

## 👨‍💻 Author

**Kirubel Mesfin**  
💼 Passionate full-stack developer building real-world MERN applications.  
📧 Reach out: [GitHub Profile](https://github.com/kirubelm1)

---

⭐ If you like this project, give it a star on GitHub!
