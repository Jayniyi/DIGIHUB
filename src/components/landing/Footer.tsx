import { Zap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <Zap className="w-4 h-4 text-secondary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg text-primary-foreground">
              DigiProHub
            </span>
          </div>
          <p className="text-primary-foreground/50 text-sm">
            © {new Date().getFullYear()} DigiProHub. Powering Nigerian businesses online.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
