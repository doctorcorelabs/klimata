import { motion } from "framer-motion";
import { Droplets, Heart, Phone, Mail, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-surface-dark text-surface-dark-foreground">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Droplets className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">Klimata</span>
          </div>

          {/* Slogan */}
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 max-w-2xl mx-auto leading-tight">
            Lingkungan Terjaga,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary-light">
              Warga Sehat
            </span>{" "}
            dan Tangguh Bencana
          </h3>
          
          <p className="text-surface-dark-foreground/60 max-w-xl mx-auto">
            Bersama kita bisa membangun daerah yang lebih siap menghadapi bencana dan menjaga kesehatan keluarga.
          </p>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12"
        >
          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-surface-dark-foreground/5 hover:bg-surface-dark-foreground/10 transition-colors">
            <Phone className="w-5 h-5 text-primary-light" />
            <span className="text-sm">112 (Darurat)</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-surface-dark-foreground/5 hover:bg-surface-dark-foreground/10 transition-colors">
            <Mail className="w-5 h-5 text-secondary-light" />
            <span className="text-sm">daivanlabs@gmail.com</span>
          </div>
          <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-surface-dark-foreground/5 hover:bg-surface-dark-foreground/10 transition-colors">
            <MapPin className="w-5 h-5 text-accent-light" />
            <span className="text-sm">Indonesia</span>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 text-sm text-surface-dark-foreground/60"
        >
          <a href="#beranda" className="hover:text-primary-light transition-colors">
            Beranda
          </a>
          <a href="#risiko" className="hover:text-primary-light transition-colors">
            Risiko Kesehatan
          </a>
          <a href="#aksi" className="hover:text-primary-light transition-colors">
            Aksi Warga
          </a>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-dark-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-surface-dark-foreground/50">
            <p>
              Bagian dari Inisiatif Kesehatan Masyarakat Desa Bantaran Sungai
            </p>
            <p className="flex items-center gap-1">
              Backed by <Heart className="w-4 h-4 text-destructive" /> Daivanlabs
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
