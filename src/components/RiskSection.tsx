import { motion } from "framer-motion";
import { Bug, Droplet, Thermometer } from "lucide-react";

const riskCards = [
  {
    icon: Bug,
    title: "Ancaman Nyamuk",
    description: "Genangan air pasca banjir meningkatkan risiko DBD & Malaria.",
    color: "primary" as const,
  },
  {
    icon: Droplet,
    title: "Penyakit Kulit & Diare",
    description: "Air bersih yang tercemar banjir membawa bakteri berbahaya.",
    color: "secondary" as const,
  },
  {
    icon: Thermometer,
    title: "Kelelahan Panas",
    description: "Waspada cuaca ekstrem & panas menyengat saat banjir surut.",
    color: "accent" as const,
  },
];

const iconContainerStyles = {
  primary: "icon-container-primary",
  secondary: "icon-container-secondary",
  accent: "icon-container-accent",
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
};

export function RiskSection() {
  return (
    <section id="risiko" className="py-20 md:py-28 bg-section-alt">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            Informasi Penting
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Kenali Risiko Kesehatan Kita
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Banjir bukan hanya merusak harta benda, tapi juga membawa berbagai ancaman kesehatan 
            yang perlu kita waspadai bersama.
          </p>
        </motion.div>

        {/* Risk Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {riskCards.map((card, index) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-8 h-full flex flex-col items-center text-center transition-all duration-300 hover:shadow-lifted hover:border-primary/20">
                {/* Icon */}
                <div className={`${iconContainerStyles[card.color]} mb-6 transition-transform duration-300 group-hover:scale-110`}>
                  <card.icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {card.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {card.description}
                </p>

                {/* Decorative Line */}
                <div className="mt-6 w-16 h-1 rounded-full bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
