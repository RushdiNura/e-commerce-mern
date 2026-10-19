import { Link } from "react-router-dom";
import { BRAND } from "../config";

const Footer = () => (
  <footer className="mt-16 border-t border-white/10 bg-slate-900 text-slate-300">
    <div className="page-container flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
      <div className="text-center md:text-left">
        <p className="text-lg font-extrabold tracking-tight text-indigo-300">{BRAND}</p>
        <p className="mt-1 text-sm text-slate-400">
          &copy; {new Date().getFullYear()} {BRAND}. All rights reserved.
        </p>
      </div>
      <nav aria-label="Footer" className="flex gap-6 text-sm">
        <Link to="/products" className="transition-colors hover:text-white">
          Products
        </Link>
        <Link to="/cart" className="transition-colors hover:text-white">
          Cart
        </Link>
        <Link to="/my-orders" className="transition-colors hover:text-white">
          My orders
        </Link>
      </nav>
    </div>
  </footer>
);

export default Footer;
