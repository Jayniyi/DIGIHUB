import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const inputClass =
  "bg-white/10 border-white/25 text-white placeholder:text-white/50 focus:border-secondary focus:ring-secondary/30";

const LeadCaptureSection = () => {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    toast({
      title: "Request received!",
      description: "We'll get back to you within 24 hours.",
    });
  };

  return (
    <section id="contact" className="py-24 hero-gradient">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Get Started</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
              Ready to Grow Your Business?
            </h2>
            <p className="text-white/60 text-lg">
              Tell us about your business and we'll create a custom digital strategy for you.
            </p>
          </motion.div>

          {submitted ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
              <h3 className="font-heading text-2xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-white/60">Our team will reach out within 24 hours.</p>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="rounded-2xl p-8 space-y-5 bg-white/[0.07] backdrop-blur-xl border border-white/15 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/90 text-sm font-medium mb-1.5 block">Business Name</label>
                  <Input required placeholder="Your Business Name" className={inputClass} />
                </div>
                <div>
                  <label className="text-white/90 text-sm font-medium mb-1.5 block">Your Name</label>
                  <Input required placeholder="Full Name" className={inputClass} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/90 text-sm font-medium mb-1.5 block">Email</label>
                  <Input type="email" required placeholder="you@business.com" className={inputClass} />
                </div>
                <div>
                  <label className="text-white/90 text-sm font-medium mb-1.5 block">Phone</label>
                  <Input type="tel" required placeholder="+234..." className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-white/90 text-sm font-medium mb-1.5 block">Service Interested In</label>
                <Select required>
                  <SelectTrigger className="bg-white/10 border-white/25 text-white [&>span]:text-white/50 focus:border-secondary">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="website">Website Development</SelectItem>
                    <SelectItem value="ads">Digital Ads Management</SelectItem>
                    <SelectItem value="design">Flyer & Graphics Design</SelectItem>
                    <SelectItem value="branding">Branding & Logo Design</SelectItem>
                    <SelectItem value="seo">SEO Optimization</SelectItem>
                    <SelectItem value="google-business">Google Business Setup</SelectItem>
                    <SelectItem value="full-package">Full Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white/90 text-sm font-medium mb-1.5 block">Tell Us About Your Business</label>
                <Textarea
                  placeholder="What does your business do? What are your digital goals?"
                  rows={4}
                  className={inputClass}
                />
              </div>

              <Button type="submit" variant="hero" size="lg" className="w-full">
                <Send className="w-5 h-5" />
                Send Request
              </Button>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
};

export default LeadCaptureSection;
