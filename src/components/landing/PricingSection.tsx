import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const packages = [
  {
    name: "Basic",
    price: "₦50,000",
    period: "/project",
    description: "Perfect for businesses just getting started online.",
    features: [
      "Single-page website",
      "Basic SEO setup",
      "Google Business Profile",
      "2 social media graphics",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "Standard",
    price: "₦150,000",
    period: "/month",
    description: "For businesses ready to scale their digital presence.",
    features: [
      "Multi-page website",
      "Monthly ad management",
      "10 flyers/graphics per month",
      "Full SEO optimization",
      "Google Business + Maps",
      "Priority support",
      "Monthly performance report",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: "₦350,000",
    period: "/month",
    description: "Full-service digital partner for serious businesses.",
    features: [
      "Custom web application",
      "Multi-platform ad campaigns",
      "Unlimited graphics & design",
      "Full branding package",
      "Advanced SEO & content",
      "Dedicated account manager",
      "Weekly reports & strategy calls",
      "CRM & lead management",
    ],
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Pricing</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Transparent Pricing, Real Results
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Choose a package that fits your budget and goals. All plans include dedicated support.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              className={`rounded-2xl p-6 border transition-all duration-300 ${
                pkg.popular
                  ? "bg-primary text-primary-foreground border-secondary shadow-xl amber-glow scale-105"
                  : "bg-card border-border hover:shadow-lg"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              {pkg.popular && (
                <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold mb-4">
                  Most Popular
                </span>
              )}
              <h3 className="font-heading text-xl font-bold">{pkg.name}</h3>
              <div className="mt-3 mb-1">
                <span className="text-3xl font-heading font-bold">{pkg.price}</span>
                <span className={`text-sm ${pkg.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{pkg.period}</span>
              </div>
              <p className={`text-sm mb-6 ${pkg.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {pkg.description}
              </p>
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${pkg.popular ? "text-secondary" : "text-secondary"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={pkg.popular ? "hero" : "outline"}
                className="w-full"
                size="lg"
                asChild
              >
                <Link to="/auth?tab=signup">Get Started</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
