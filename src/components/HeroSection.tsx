import { motion } from "framer-motion";
import { ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-river-village.jpg";

export function HeroSection() {
  return (
    <section
      id="beranda"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Desa bantaran sungai yang indah"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-hero-dark" />
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-10 w-20 h-20 rounded-full bg-secondary/20 blur-xl hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 left-20 w-32 h-32 rounded-full bg-primary/20 blur-xl hidden lg:block"
      />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-dark/30 backdrop-blur-md border border-surface-dark-foreground/20 text-surface-dark-foreground mb-6"
          >
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">Siaga Sehat • Tangguh Bencana</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-surface-dark-foreground leading-tight mb-6"
          >
            Selamat Datang di{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-secondary-light">
              Klimata
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-surface-dark-foreground/80 mb-8 leading-relaxed"
          >
            Desa kita indah, namun alam sedang berubah. Mari kenali dampak perubahan iklim global 
            terhadap risiko banjir dan kesehatan keluarga kita di sini.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="hero" size="xl" className="group" asChild>
              <a href="#risiko">
                Pelajari Cara Lindungi Keluarga
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <a href="#aksi">Lihat Aksi Nyata</a>
            </Button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-surface-dark-foreground/40 flex items-start justify-center p-2"
          >
            <div className="w-1.5 h-3 rounded-full bg-surface-dark-foreground/60" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
