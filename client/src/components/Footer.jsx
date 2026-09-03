import React from "react";

const Footer = () => (
  <footer className="bg-slate-900 text-slate-300 py-6">
    <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
      <p className="text-sm">
        &copy; {new Date().getFullYear()} TechMart. All rights reserved.
      </p>
      <div className="flex space-x-4 mt-3 md:mt-0">
        <a href="#" className="hover:text-indigo-400">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-indigo-400">
          Terms
        </a>
        <a href="#" className="hover:text-indigo-400">
          Support
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
