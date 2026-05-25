import { motion } from "framer-motion";
import { Globe, Megaphone, Palette, PenTool, Search, MapPin } from "lucide-react";

const services = [
  {
    icon: Globe,
    title: "Website Development",
    description: "Modern, mobile-friendly websites that convert visitors into customers. Built with the latest technologies.",
  },
  {
    icon: Megaphone,
    title: "Digital Ads Management",
    description: "Targeted campaigns on Google, Facebook, Instagram & YouTube to reach your ideal customers.",
  },
  {
    icon: Palette,
    title: "Flyer & Graphics Design",
    description: "Eye-catching flyers, social media graphics, and marketing materials that make your brand stand out.",
  },
  {
    icon: PenTool,
    title: "Branding & Logo Design",
    description: "Build a powerful brand identity with professional logos, brand guidelines, and visual systems.",
  },
  {
    icon: Search,
    title: "SEO Optimization",
    description: "Rank higher on Google and drive organic traffic to your website with proven SEO strategies.",
  },
  {
    icon: MapPin,
    title: "Google Business Setup",
    description: "Get found on Google Maps and local search results. Perfect for businesses serving local customers.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Our Services</span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mt-3 mb-4">
            Everything Your Business Needs to Go Digital
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From your first website to running high-converting ad campaigns, we've got you covered.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              className="group glass-card rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-secondary/30"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <service.icon className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
