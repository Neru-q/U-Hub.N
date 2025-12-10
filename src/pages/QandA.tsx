import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpCircle, 
  Plus, 
  Search,
  Loader2,
  ChevronUp,
  ChevronDown,
  MessageCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Question {
  id: string;
  title: string;
  body: string;
  is_resolved: boolean | null;
  view_count: number | null;
  created_at: string;
  user_id: string;
  course_id: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  course?: {
    name: string;
    code: string;
  };
  votes_count: number;
  answers_count: number;
  user_vote: number;
}

interface Answer {
  id: string;
  body: string;
  is_accepted: boolean | null;
  created_at: string;
  user_id: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  votes_count: number;
  user_vote: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

const QandA = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  
  // Question dialog
  const [askOpen, setAskOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ title: '', body: '', courseId: '' });
  
  // Selected question
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [answerLoading, setAnswerLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchQuestions();
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('id, name, code').order('name');
    if (data) setCourses(data);
  };

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const questionsWithDetails = await Promise.all(
        (data || []).map(async (question) => {
          const [profileRes, courseRes, votesRes, answersRes, userVoteRes] = await Promise.all([
            supabase.from('profiles').select('full_name, avatar_url').eq('id', question.user_id).maybeSingle(),
            supabase.from('courses').select('name, code').eq('id', question.course_id).maybeSingle(),
            supabase.from('question_votes').select('vote_type').eq('question_id', question.id),
            supabase.from('answers').select('id', { count: 'exact' }).eq('question_id', question.id),
            supabase.from('question_votes').select('vote_type').eq('question_id', question.id).eq('user_id', user!.id).maybeSingle(),
          ]);

          const votesCount = (votesRes.data || []).reduce((sum, v) => sum + v.vote_type, 0);

          return {
            ...question,
            profile: profileRes.data,
            course: courseRes.data,
            votes_count: votesCount,
            answers_count: answersRes.count || 0,
            user_vote: userVoteRes.data?.vote_type || 0,
          };
        })
      );

      setQuestions(questionsWithDetails);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (questionId: string) => {
    try {
      const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId)
        .order('is_accepted', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;

      const answersWithDetails = await Promise.all(
        (data || []).map(async (answer) => {
          const [profileRes, votesRes, userVoteRes] = await Promise.all([
            supabase.from('profiles').select('full_name, avatar_url').eq('id', answer.user_id).maybeSingle(),
            supabase.from('question_votes').select('vote_type').eq('answer_id', answer.id),
            supabase.from('question_votes').select('vote_type').eq('answer_id', answer.id).eq('user_id', user!.id).maybeSingle(),
          ]);

          const votesCount = (votesRes.data || []).reduce((sum, v) => sum + v.vote_type, 0);

          return {
            ...answer,
            profile: profileRes.data,
            votes_count: votesCount,
            user_vote: userVoteRes.data?.vote_type || 0,
          };
        })
      );

      setAnswers(answersWithDetails);
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.title || !newQuestion.body || !newQuestion.courseId || !user) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setAsking(true);
    try {
      const { error } = await supabase.from('questions').insert({
        title: newQuestion.title,
        body: newQuestion.body,
        course_id: newQuestion.courseId,
        user_id: user.id,
      });

      if (error) throw error;

      setAskOpen(false);
      setNewQuestion({ title: '', body: '', courseId: '' });
      fetchQuestions();
      toast({ title: 'Question posted!' });
    } catch (error: any) {
      toast({ title: 'Failed to post question', description: error.message, variant: 'destructive' });
    } finally {
      setAsking(false);
    }
  };

  const handleVote = async (type: 'question' | 'answer', id: string, currentVote: number, newVote: number) => {
    if (!user) return;

    try {
      // Remove existing vote
      if (currentVote !== 0) {
        await supabase.from('question_votes')
          .delete()
          .eq('user_id', user.id)
          .eq(type === 'question' ? 'question_id' : 'answer_id', id);
      }

      // Add new vote if different from current
      if (newVote !== 0 && newVote !== currentVote) {
        await supabase.from('question_votes').insert({
          user_id: user.id,
          [type === 'question' ? 'question_id' : 'answer_id']: id,
          vote_type: newVote,
        });
      }

      // Refresh data
      if (type === 'question') {
        fetchQuestions();
      } else if (selectedQuestion) {
        fetchAnswers(selectedQuestion.id);
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim() || !selectedQuestion || !user) return;

    setAnswerLoading(true);
    try {
      const { error } = await supabase.from('answers').insert({
        body: newAnswer.trim(),
        question_id: selectedQuestion.id,
        user_id: user.id,
      });

      if (error) throw error;

      setNewAnswer('');
      fetchAnswers(selectedQuestion.id);
      setQuestions(questions.map(q => 
        q.id === selectedQuestion.id 
          ? { ...q, answers_count: q.answers_count + 1 } 
          : q
      ));
      toast({ title: 'Answer posted!' });
    } catch (error: any) {
      toast({ title: 'Failed to post answer', description: error.message, variant: 'destructive' });
    } finally {
      setAnswerLoading(false);
    }
  };

  const openQuestion = (question: Question) => {
    setSelectedQuestion(question);
    fetchAnswers(question.id);
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === 'all' || q.course_id === filterCourse;
    return matchesSearch && matchesCourse;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Q&A Forum</h1>
            <p className="text-muted-foreground">Ask questions and help fellow students</p>
          </div>
          
          <Dialog open={askOpen} onOpenChange={setAskOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-accent text-accent-foreground hover:shadow-accent transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Ask Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Ask a Question</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="What's your question?"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Course *</Label>
                  <Select 
                    value={newQuestion.courseId} 
                    onValueChange={(v) => setNewQuestion({ ...newQuestion, courseId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Details *</Label>
                  <Textarea
                    placeholder="Provide more details about your question..."
                    value={newQuestion.body}
                    onChange={(e) => setNewQuestion({ ...newQuestion, body: e.target.value })}
                    className="min-h-[150px]"
                  />
                </div>
                <Button 
                  onClick={handleAskQuestion} 
                  disabled={asking}
                  className="gradient-accent text-accent-foreground hover:shadow-accent transition-all duration-300"
                >
                  {asking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Post Question
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Questions List */}
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <Card 
                key={question.id} 
                className={`cursor-pointer hover-lift ${selectedQuestion?.id === question.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => openQuestion(question)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Vote Column */}
                    <div className="flex flex-col items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 ${question.user_vote === 1 ? 'text-primary' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote('question', question.id, question.user_vote, question.user_vote === 1 ? 0 : 1);
                        }}
                      >
                        <ChevronUp className="w-5 h-5" />
                      </Button>
                      <span className="font-semibold text-sm">{question.votes_count}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 ${question.user_vote === -1 ? 'text-destructive' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote('question', question.id, question.user_vote, question.user_vote === -1 ? 0 : -1);
                        }}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className="font-semibold line-clamp-2">{question.title}</h3>
                        {question.is_resolved && (
                          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{question.body}</p>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Badge variant="secondary">{question.course?.code}</Badge>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MessageCircle className="w-4 h-4" />
                          {question.answers_count}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          {question.view_count || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={question.profile?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs gradient-primary text-primary-foreground">
                            {question.profile?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {question.profile?.full_name || 'Anonymous'} • {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No questions found</h3>
                <p className="text-muted-foreground">Be the first to ask a question!</p>
              </div>
            )}
          </div>

          {/* Selected Question Detail */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            {selectedQuestion ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <CardTitle className="flex-1">{selectedQuestion.title}</CardTitle>
                    {selectedQuestion.is_resolved && (
                      <Badge className="bg-success text-success-foreground">Resolved</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedQuestion.profile?.avatar_url || undefined} />
                      <AvatarFallback className="gradient-primary text-primary-foreground">
                        {selectedQuestion.profile?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{selectedQuestion.profile?.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(selectedQuestion.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="whitespace-pre-wrap">{selectedQuestion.body}</p>

                  <div className="border-t pt-6">
                    <h4 className="font-semibold mb-4">{answers.length} Answers</h4>
                    
                    <div className="space-y-4 mb-6">
                      {answers.map((answer) => (
                        <div key={answer.id} className={`flex gap-3 p-4 rounded-lg ${answer.is_accepted ? 'bg-success/10 border border-success/20' : 'bg-muted'}`}>
                          <div className="flex flex-col items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-6 w-6 ${answer.user_vote === 1 ? 'text-primary' : ''}`}
                              onClick={() => handleVote('answer', answer.id, answer.user_vote, answer.user_vote === 1 ? 0 : 1)}
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <span className="text-sm font-medium">{answer.votes_count}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-6 w-6 ${answer.user_vote === -1 ? 'text-destructive' : ''}`}
                              onClick={() => handleVote('answer', answer.id, answer.user_vote, answer.user_vote === -1 ? 0 : -1)}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={answer.profile?.avatar_url || undefined} />
                                <AvatarFallback className="text-xs gradient-primary text-primary-foreground">
                                  {answer.profile?.full_name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{answer.profile?.full_name || 'Anonymous'}</span>
                              {answer.is_accepted && (
                                <Badge className="bg-success text-success-foreground">Accepted</Badge>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{answer.body}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Answer Form */}
                    <div className="space-y-3">
                      <Label>Your Answer</Label>
                      <Textarea
                        placeholder="Write your answer..."
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button 
                        onClick={handleSubmitAnswer}
                        disabled={!newAnswer.trim() || answerLoading}
                        className="gradient-primary"
                      >
                        {answerLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Post Answer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-64 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a question to view details</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default QandA;
