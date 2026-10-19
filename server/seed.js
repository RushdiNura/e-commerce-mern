// Seed script — run from the /server folder:
//   node seed.js            -> adds demo data (safe to re-run, never creates duplicates)
//   node seed.js --fresh    -> FIRST deletes products, categories, carts, orders, then re-seeds
//
// Uses MONGO_URI from server/.env. To seed your deployed database, put that
// database's connection string in MONGO_URI while running it.
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/User.js";
import Category from "./models/Category.js";
import Product from "./models/Product.js";
import Order from "./models/Order.js";
import Cart from "./models/Cart.js";

dotenv.config();

const FRESH = process.argv.includes("--fresh");

// Change these (or set them in .env) — do NOT keep the defaults on a public site.
const ADMIN = {
  name: "Store Admin",
  email: process.env.SEED_ADMIN_EMAIL || "admin@techzone.com",
  password: process.env.SEED_ADMIN_PASSWORD || "Admin@12345",
  role: "admin",
};
const CUSTOMER = {
  name: "Demo Customer",
  email: process.env.SEED_USER_EMAIL || "customer@techzone.com",
  password: process.env.SEED_USER_PASSWORD || "Customer@12345",
  role: "user",
};
const REVIEWERS = [
  { name: "Sara Ahmed", email: "sara.reviewer@techzone.com" },
  { name: "Daniel Lee", email: "daniel.reviewer@techzone.com" },
  { name: "Maria Gomez", email: "maria.reviewer@techzone.com" },
];

const U = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const CATEGORIES = [
  { name: "Laptops", description: "Laptops for work, study and play" },
  {
    name: "Headphones",
    description: "Wireless and wired headphones & earbuds",
  },
  { name: "Smartwatches", description: "Smartwatches and fitness trackers" },
  { name: "Accessories", description: "Keyboards, mice, chargers and more" },
];

// image URLs are Unsplash photos; the storefront shows a placeholder if one is ever unavailable
const PRODUCTS = [
  {
    name: "HP Pavilion 15 Laptop",
    category: "Laptops",
    price: 749.99,
    stock: 14,
    description:
      '15.6" Full HD display, 12th Gen Intel Core i5, 16GB RAM and 512GB SSD. A reliable all-rounder for work, study and streaming with up to 9 hours of battery life.',
    images: [
      "photo-1517336714731-489689fd1ca8",
      "photo-1496181133206-80ce9b88a853",
    ],
  },
  {
    name: "UltraBook Pro 14",
    category: "Laptops",
    price: 1299.0,
    stock: 8,
    description:
      'Slim 14" aluminium ultrabook with a 2.8K display, Ryzen 7 processor, 16GB RAM and 1TB SSD. Light enough to carry all day, powerful enough for editing.',
    images: [
      "photo-1588872657578-7efd1f1555ed",
      "photo-1593642632823-8f785ba67e45",
    ],
  },
  {
    name: "Gamer X 16 Gaming Laptop",
    category: "Laptops",
    price: 1599.99,
    stock: 5,
    description:
      '16" 165Hz display, RTX graphics, Core i7, 32GB RAM and 1TB NVMe storage. Built for high-frame-rate gaming and heavy multitasking.',
    images: [
      "photo-1603302576837-37561b2e2302",
      "photo-1515378791036-0648a3ef77b2",
    ],
  },
  {
    name: "Student Chromebook 11",
    category: "Laptops",
    price: 279.0,
    stock: 30,
    description:
      'Lightweight 11.6" Chromebook with a spill-resistant keyboard and 12-hour battery. Ideal for school, browsing and online classes.',
    images: ["photo-1611186871348-b1ce696e52c9"],
  },
  {
    name: "Wireless Headphones Pro",
    category: "Headphones",
    price: 149.0,
    stock: 40,
    description:
      "Over-ear Bluetooth headphones with active noise cancelling, 40-hour battery and a comfortable memory-foam fit. Crisp highs and deep bass.",
    images: [
      "photo-1585386959984-a41552231693",
      "photo-1505740420928-5e560c06d30e",
    ],
  },
  {
    name: "StudioMonitor Wired Headphones",
    category: "Headphones",
    price: 89.5,
    stock: 22,
    description:
      "Closed-back studio headphones with detachable cable and 40mm drivers. Accurate, balanced sound for mixing and everyday listening.",
    images: ["photo-1484704849700-f032a568e944"],
  },
  {
    name: "AirBeat True Wireless Earbuds",
    category: "Headphones",
    price: 79.99,
    stock: 60,
    description:
      "Compact true wireless earbuds with 24-hour total battery, IPX5 sweat resistance and a pocket-sized charging case.",
    images: [
      "photo-1590658268037-6bf12165a8df",
      "photo-1606220588913-b3aacb4d2f46",
    ],
  },
  {
    name: "Kids Safe-Sound Headphones",
    category: "Headphones",
    price: 29.99,
    stock: 3,
    description:
      "Volume-limited (85 dB) foldable headphones with a durable, adjustable band, made for young listeners.",
    images: ["photo-1583394838336-acd977736f90"],
  },
  {
    name: "FitPulse Smartwatch S2",
    category: "Smartwatches",
    price: 199.0,
    stock: 25,
    description:
      '1.4" AMOLED smartwatch with heart-rate and SpO2 monitoring, GPS, 100+ sport modes and 7-day battery life.',
    images: [
      "photo-1546868871-7041f2a55e12",
      "photo-1523275335684-37898b6baf30",
    ],
  },
  {
    name: "Classic Steel Smartwatch",
    category: "Smartwatches",
    price: 249.0,
    stock: 12,
    description:
      "Stainless-steel hybrid smartwatch with notifications, sleep tracking and water resistance to 50m.",
    images: ["photo-1508685096489-7aacd43bd3b1"],
  },
  {
    name: "Mechanical Keyboard K87",
    category: "Accessories",
    price: 69.0,
    stock: 35,
    description:
      "Compact tenkeyless mechanical keyboard with hot-swappable switches, white backlight and a braided USB-C cable.",
    images: ["photo-1587829741301-dc798b83add3"],
  },
  {
    name: "ErgoGlide Wireless Mouse",
    category: "Accessories",
    price: 34.99,
    stock: 0,
    description:
      "Ergonomic wireless mouse with silent clicks, adjustable 4000 DPI and a rechargeable battery that lasts months.",
    images: ["photo-1527864550417-7fd91fc51a46"],
  },
  {
    name: "65W GaN USB-C Fast Charger",
    category: "Accessories",
    price: 39.99,
    stock: 50,
    description:
      "Pocket-size 65W GaN charger with two USB-C ports and one USB-A. Charges a laptop and a phone at the same time.",
    images: ["photo-1583863788434-e58a36330cf0"],
  },
  {
    name: 'Laptop Sleeve 15"',
    category: "Accessories",
    price: 24.5,
    stock: 45,
    description:
      'Water-resistant padded sleeve that fits laptops up to 15.6", with a soft microfibre lining and a front pocket.',
    images: ["photo-1491472253230-a044054ca35f"],
  },
];

const REVIEWS = [
  [5, "Absolutely worth the money. Fast shipping and exactly as described."],
  [4, "Great quality for the price. Only small complaint is the packaging."],
  [5, "Been using it daily for a month — no issues at all. Highly recommend."],
  [3, "Good, but I expected a little more at this price point."],
  [4, "Solid build and works perfectly. Would buy again."],
];

async function upsertUser({ name, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  return User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role,
  });
}

async function main() {
  if (!process.env.MONGO_URI)
    throw new Error("MONGO_URI is not set in server/.env");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  if (FRESH) {
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      Cart.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log("--fresh: cleared products, categories, carts and orders");
  }

  // users
  const admin = await upsertUser(ADMIN);
  const customer = await upsertUser(CUSTOMER);
  const reviewers = [];
  for (const r of REVIEWERS) {
    reviewers.push(
      await upsertUser({
        ...r,
        password: `Reviewer-${Date.now()}-${Math.random()}`,
        role: "user",
      }),
    );
  }

  // categories
  const catByName = {};
  for (const c of CATEGORIES) {
    catByName[c.name] =
      (await Category.findOne({ name: c.name })) || (await Category.create(c));
  }

  // products (matched by name, so re-running never duplicates)
  let created = 0;
  const saved = [];
  for (const [i, p] of PRODUCTS.entries()) {
    let doc = await Product.findOne({ name: p.name });
    if (!doc) {
      doc = new Product({
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: catByName[p.category]._id,
        image: p.images.map((id, n) => ({
          url: U(id),
          filename: `seed/${i}-${n}`,
        })),
      });
      // 3-5 demo reviews on most products so ratings look realistic
      if (i % 5 !== 3) {
        const count = 3 + (i % 3);
        for (let k = 0; k < Math.min(count, reviewers.length); k++) {
          const [rating, comment] = REVIEWS[(i + k) % REVIEWS.length];
          doc.reviews.push({
            user: reviewers[k]._id,
            userName: REVIEWERS[k].name,
            rating,
            comment,
          });
        }
      }
      await doc.save(); // the model's pre-save hook calculates rating & numReviews
      created++;
    }
    saved.push(doc);
  }

  // a few demo orders for the customer (only if they have none yet)
  if ((await Order.countDocuments({ user: customer._id })) === 0) {
    const byName = Object.fromEntries(saved.map((d) => [d.name, d]));
    const mk = (items, status, daysAgo, method) => {
      const lines = items.map(([name, quantity]) => {
        const p = byName[name];
        if (!p)
          throw new Error(
            `Seed order references an unknown product: "${name}"`,
          );
        return { product: p._id, quantity, price: p.price };
      });
      return {
        user: customer._id,
        orderItems: lines,
        shippingAddress: {
          address: "221B Baker Street",
          city: "London",
          postalCode: "NW1 6XE",
          country: "United Kingdom",
        },
        totalPrice:
          Math.round(
            lines.reduce((s, l) => s + l.price * l.quantity, 0) * 100,
          ) / 100,
        paymentMethod: method,
        status,
        createdAt: new Date(Date.now() - daysAgo * 864e5),
      };
    };
    await Order.insertMany([
      mk(
        [
          ["Wireless Headphones Pro", 1],
          ['Laptop Sleeve 15"', 1],
        ],
        "Delivered",
        21,
        "Card",
      ),
      mk([["FitPulse Smartwatch S2", 1]], "Shipped", 4, "PayPal"),
      mk(
        [
          ["HP Pavilion 15 Laptop", 1],
          ["Mechanical Keyboard K87", 1],
        ],
        "Processing",
        1,
        "Cash on Delivery",
      ),
    ]);
    console.log("Created 3 demo orders for the demo customer");
  }

  console.log(
    `\nDone. ${created} new products added (${PRODUCTS.length - created} already existed).`,
  );
  console.log("\nLogin accounts:");
  console.log(`  Admin     ${ADMIN.email}  /  ${ADMIN.password}`);
  console.log(`  Customer  ${CUSTOMER.email}  /  ${CUSTOMER.password}`);
  console.log(
    "\n(If an account already existed, its original password is unchanged.)",
  );
  console.log(
    "IMPORTANT: change the admin password before real customers use the site.",
  );
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
