// One place to change the store name and shared constants.
export const BRAND = "TechZone";

export const PAGE_SIZE = 12;

// Values must match the `paymentMethod` enum in server/models/Order.js
export const PAYMENT_METHODS = [
  { value: "Card", label: "Credit / Debit Card" },
  { value: "PayPal", label: "PayPal" },
  { value: "Cash on Delivery", label: "Cash on Delivery" },
];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e2e8f0"/><g fill="none" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><rect x="130" y="95" width="140" height="110" rx="12"/><circle cx="170" cy="135" r="12"/><path d="M135 195l45-40 30 25 25-20 35 35"/></g></svg>`;

// Shown whenever a product image is missing or fails to load.
export const FALLBACK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
