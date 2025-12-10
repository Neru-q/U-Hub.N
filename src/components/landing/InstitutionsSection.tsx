import { motion } from "framer-motion";
import { Building2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const institutions = [
  { name: "University of Cape Town", abbr: "UCT", students: "2.3K+" },
  { name: "Stellenbosch University", abbr: "SU", students: "1.8K+" },
  { name: "University of Pretoria", abbr: "UP", students: "2.1K+" },
  { name: "Wits University", abbr: "Wits", students: "1.9K+" },
  { name: "University of Johannesburg", abbr: "UJ", students: "1.5K+" },
  { name: "Rhodes University", abbr: "RU", students: "800+" },
];

export function InstitutionsSection() {
  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-institution-primary/10 border border-institution-primary/20 mb-6">
              <Building2 className="h-4 w-4 text-institution-primary" />
              <span className="text-sm font-medium text-institution-primary">Partner Institutions</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Trusted by Top{" "}
              <span className="text-gradient">South African Universities</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Students from leading institutions across South Africa are already 
              collaborating, sharing knowledge, and achieving more together on StudyHub.
            </p>

            <Button variant="hero" size="lg" asChild>
              <Link to="/institutions" className="group">
                Find Your Institution
                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          {/* Right - Institution cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {institutions.map((institution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group p-5 rounded-xl bg-card border border-border hover:border-accent/30 shadow-soft hover:shadow-card hover-lift cursor-pointer"
              >
                {/* Institution icon */}
                <div className="w-12 h-12 rounded-xl bg-hero flex items-center justify-center mb-4">
                  <span className="text-sm font-bold text-primary-foreground">
                    {institution.abbr}
                  </span>
                </div>
                
                <h3 className="font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                  {institution.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {institution.students} active students
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
