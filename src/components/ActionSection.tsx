import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Trees, 
  CheckCircle2, 
  Droplets, 
  Backpack, 
  Wind, 
  Trash2, 
  TreeDeciduous, 
  ShowerHead 
} from "lucide-react";

const tabs = [
  {
    id: "adaptasi",
    label: "Adaptasi - Di Rumah",
    icon: Home,
    color: "primary",
    actions: [
      {
        icon: Droplets,
        text: "Simpan air bersih di wadah tertutup & aman.",
      },
      {
        icon: Backpack,
        text: "Siapkan Tas Siaga Bencana (Obat & Dokumen).",
      },
      {
        icon: Wind,
        text: "Pastikan ventilasi rumah lancar untuk sirkulasi udara.",
      },
    ],
  },
  {
    id: "mitigasi",
    label: "Mitigasi - Di Lingkungan",
    icon: Trees,
    color: "secondary",
    actions: [
      {
        icon: ShowerHead,
        text: "Kerja bakti rutin bersihkan selokan.",
      },
      {
        icon: Trash2,
        text: "Kelola sampah rumah tangga (Jangan buang ke sungai!).",
      },
      {
        icon: TreeDeciduous,
        text: "Tanam pohon peneduh di bantaran sungai.",
      },
    ],
  },
];

export function ActionSection() {
  const [activeTab, setActiveTab] = useState("adaptasi");

  const activeTabData = tabs.find((tab) => tab.id === activeTab)!;

  return (
    <section id="aksi" className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-semibold mb-4">
            Langkah Nyata
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Jangan Diam Saja, Mari Bergerak!
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Perubahan dimulai dari langkah kecil. Pilih aksi yang bisa kamu lakukan hari ini.
          </p>
        </motion.div>

        {/* Tab Container */}
        <div className="max-w-3xl mx-auto">
          {/* Tab Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 mb-8"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? tab.color === "primary"
                      ? "bg-primary text-primary-foreground shadow-medium"
                      : "bg-secondary text-secondary-foreground shadow-medium"
                    : "bg-card text-muted-foreground hover:bg-muted border border-border"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-2xl p-6 md:p-8"
            >
              <div className="space-y-4">
                {activeTabData.actions.map((action, index) => (
                  <motion.div
                    key={action.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-background/50 hover:bg-muted/50 transition-colors group"
                  >
                    <div className={`p-2 rounded-lg ${
                      activeTabData.color === "primary" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-secondary/10 text-secondary"
                    }`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <p className="text-foreground font-medium flex-1 pt-1">
                      {action.text}
                    </p>
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors mt-1" />
                  </motion.div>
                ))}
              </div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 pt-6 border-t border-border text-center"
              >
                <p className="text-muted-foreground text-sm">
                  💡 Tip: Mulai dengan satu aksi sederhana dan ajak tetangga untuk ikut serta!
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
