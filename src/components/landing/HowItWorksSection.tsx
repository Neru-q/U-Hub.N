import { CheckCircle } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Sign up with your student email',
    description: 'Create an account using your university email to verify your student status.',
  },
  {
    step: '02',
    title: 'Join your university community',
    description: 'Connect with students from your institution and enroll in your courses.',
  },
  {
    step: '03',
    title: 'Share and access resources',
    description: 'Upload notes, ask questions, and collaborate with fellow students.',
  },
  {
    step: '04',
    title: 'Succeed together',
    description: 'Help each other learn and grow throughout your academic journey.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get started in <span className="text-gradient">4 simple steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join the community and start benefiting from shared knowledge immediately
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-border hidden md:block" />

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={step.step} className="flex gap-6 items-start">
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {step.step}
                    </div>
                  </div>
                  <div className="pt-2">
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
