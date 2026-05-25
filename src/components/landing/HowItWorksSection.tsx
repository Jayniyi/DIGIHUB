import { motion } from "framer-motion";
import { UserPlus, FileText, Rocket, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your free account and tell us about your business.",
  },
  {
    icon: FileText,
    title: "Request Services",
    description: "Choose from our services — website, ads, design, branding, or SEO.",
  },
  {
    icon: Rocket,
    title: "We Execute",
    description: "Our team of experts gets to work. Track progress from your dashboard.",
  },
  {
    icon: BarChart3,
    title: "Grow Your Business",
    description: "See results, get reports, and scale your digital presence.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 hero-gradient">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-hero-foreground mt-3 mb-4">
            Get Started in 4 Simple Steps
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="text-center relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <div className="relative inline-flex">
                <div className="w-16 h-16 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-center mb-5">
                  <step.icon className="w-7 h-7 text-secondary" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </span>
              </div>
              <h3 className="font-heading font-semibold text-lg text-hero-foreground mb-2">{step.title}</h3>
              <p className="text-hero-foreground/60 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
