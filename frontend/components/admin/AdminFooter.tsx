'use client';

import { MapPin, Phone, Mail, Settings, HelpCircle, FileText } from 'lucide-react';

export default function AdminFooter() {
  return (
    <footer className="bg-[#091222] text-white shadow-lg rounded-lg">
      <div className="px-3 md:px-4 py-3 md:py-4">
        <div className="max-w-full mx-auto">
          {/* Main Content */}
          <div className="flex justify-between items-start gap-2 mb-2">
            {/* Company Info - Left */}
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">S</span>
                </div>
                <h3 className="text-xs font-bold">SIKERMA POLIBATAM</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-1.5">
                Sistem Informasi Kerjasama Politeknik Negeri Batam
              </p>
              <div className="flex gap-1.5">
                <a href="#" className="text-slate-400 hover:text-white transition-colors" title="Dokumentasi">
                  <FileText size={12} />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors" title="Bantuan">
                  <HelpCircle size={12} />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors" title="Pengaturan">
                  <Settings size={12} />
                </a>
              </div>
            </div>

            {/* Contact Info - Right */}
            <div className="flex-shrink-0 text-right">
              <h4 className="text-xs font-bold mb-1.5">Kontak</h4>
              <ul className="space-y-1">
                <li className="flex items-start gap-1 text-xs justify-end">
                  <span className="text-slate-300">Jl. Ahmad Yani, Batam Kota, Kota Batam, Kepulauan Riau, Indonesia</span>
                  <MapPin size={10} className="text-slate-400 mt-0.5 flex-shrink-0" />
                </li>
                <li className="flex items-center gap-1 text-xs justify-end">
                  <a href="tel:+62-778-469829" className="text-slate-300 hover:text-white transition-colors">+62-778-469858 Ext.1017</a>
                  <Phone size={10} className="text-slate-400 flex-shrink-0" />
                </li>
                <li className="flex items-center gap-1 text-xs justify-end">
                  <a href="mailto:info@polibatam.ac.id" className="text-slate-300 hover:text-white transition-colors"> info@polibatam.ac.id atau humas@polibatam.ac.id</a>
                  <Mail size={10} className="text-slate-400 flex-shrink-0" />
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-700/60 my-1.5"></div>

          {/* Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-1 text-xs text-slate-400">
            <p>2026 SIKERMA Polibatam</p>
            <div className="flex gap-2">
              <a href="#" className="hover:text-white transition-colors">Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Syarat</a>
              <a href="#" className="hover:text-white transition-colors">Cookie</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
