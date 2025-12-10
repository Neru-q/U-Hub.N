import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Globe } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dot-pattern opacity-30" />
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Card */}
          <div className="relative p-8 sm:p-12 rounded-3xl bg-hero overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-info/10 rounded-full blur-[80px]" />
            
            {/* Content */}
            <div className="relative text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6"
              >
                Ready to Transform Your{" "}
                <span className="text-gradient">Study Experience?</span>
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-primary-foreground/70 mb-10 max-w-xl mx-auto"
              >
                Join thousands of students already succeeding together. 
                Available on web, iOS, and Android.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
              >
                <Button variant="hero" size="xl" asChild>
                  <Link to="/register" className="group">
                    Get Started Free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="glass" size="xl" asChild>
                  <Link to="/demo">
                    Watch Demo
                  </Link>
                </Button>
              </motion.div>

              {/* Platform badges */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-center justify-center gap-6"
              >
                <div className="flex items-center gap-2 text-primary-foreground/60">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm">Web</span>
                </div>
                <div className="w-px h-4 bg-primary-foreground/20" />
                <div className="flex items-center gap-2 text-primary-foreground/60">
                  <Smartphone className="h-5 w-5" />
                  <span className="text-sm">iOS & Android</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
