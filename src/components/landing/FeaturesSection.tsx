import { Card, CardContent } from '@/components/ui/card';
import { FileText, Users, HelpCircle, BookOpen, Share2, Trophy } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Share Notes',
    description: 'Upload and download study materials, lecture notes, and past papers from your courses.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Users,
    title: 'Community Feed',
    description: 'Connect with fellow students, share updates, and collaborate on academic projects.',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: HelpCircle,
    title: 'Q&A Forum',
    description: 'Ask questions and get answers from peers who have taken the same courses.',
    color: 'bg-success/10 text-success',
  },
  {
    icon: BookOpen,
    title: 'Course Materials',
    description: 'Access organized resources sorted by university, faculty, and course code.',
    color: 'bg-warning/10 text-warning',
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description: 'Quickly share resources with classmates through direct links or course groups.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Trophy,
    title: 'Earn Recognition',
    description: 'Get upvotes and recognition for contributing quality content to the community.',
    color: 'bg-accent/10 text-accent',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to <span className="text-gradient">succeed</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete platform designed to help South African students collaborate, 
            share knowledge, and excel in their studies.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="hover-lift border-2 hover:border-primary/20 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
