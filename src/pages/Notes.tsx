import { useState, useEffect, useRef } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Upload, 
  Download, 
  Search,
  Loader2,
  Heart,
  File,
  Filter
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Note {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number | null;
  download_count: number | null;
  created_at: string;
  user_id: string;
  course_id: string;
  profile?: {
    full_name: string | null;
  };
  course?: {
    name: string;
    code: string;
  };
  likes_count: number;
  is_liked: boolean;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

const Notes = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  
  // Upload state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    courseId: '',
    file: null as File | null,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchNotes();
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('id, name, code').order('name');
    if (data) setCourses(data);
  };

  const fetchNotes = async () => {
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      const notesWithDetails = await Promise.all(
        (data || []).map(async (note) => {
          const [profileRes, courseRes, likesRes, userLikeRes] = await Promise.all([
            supabase.from('profiles').select('full_name').eq('id', note.user_id).maybeSingle(),
            supabase.from('courses').select('name, code').eq('id', note.course_id).maybeSingle(),
            supabase.from('note_likes').select('id', { count: 'exact' }).eq('note_id', note.id),
            supabase.from('note_likes').select('id').eq('note_id', note.id).eq('user_id', user!.id).maybeSingle(),
          ]);

          return {
            ...note,
            profile: profileRes.data,
            course: courseRes.data,
            likes_count: likesRes.count || 0,
            is_liked: !!userLikeRes.data,
          };
        })
      );

      setNotes(notesWithDetails);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadData.title || !uploadData.courseId || !uploadData.file || !user) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      // For now, we'll use a placeholder URL since storage isn't set up
      // In production, you'd upload to Supabase Storage
      const fileUrl = `https://placeholder.com/notes/${uploadData.file.name}`;

      const { error } = await supabase.from('notes').insert({
        title: uploadData.title,
        description: uploadData.description || null,
        file_url: fileUrl,
        file_type: uploadData.file.type,
        file_size: uploadData.file.size,
        course_id: uploadData.courseId,
        user_id: user.id,
        is_public: true,
      });

      if (error) throw error;

      setUploadOpen(false);
      setUploadData({ title: '', description: '', courseId: '', file: null });
      fetchNotes();
      toast({ title: 'Note uploaded successfully!' });
    } catch (error: any) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (noteId: string, isLiked: boolean) => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase.from('note_likes').delete().eq('note_id', noteId).eq('user_id', user.id);
      } else {
        await supabase.from('note_likes').insert({ note_id: noteId, user_id: user.id });
      }

      setNotes(notes.map(note => 
        note.id === noteId 
          ? { ...note, is_liked: !isLiked, likes_count: isLiked ? note.likes_count - 1 : note.likes_count + 1 } 
          : note
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.course?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.course?.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = filterCourse === 'all' || note.course_id === filterCourse;
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
            <h1 className="text-3xl font-bold">Study Notes</h1>
            <p className="text-muted-foreground">Share and download notes from fellow students</p>
          </div>
          
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Upload className="w-4 h-4 mr-2" />
                Upload Notes
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Study Notes</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Chapter 5 Summary"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course *</Label>
                  <Select 
                    value={uploadData.courseId} 
                    onValueChange={(v) => setUploadData({ ...uploadData, courseId: v })}
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the notes..."
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>File *</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={(e) => setUploadData({ ...uploadData, file: e.target.files?.[0] || null })}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <File className="w-4 h-4 mr-2" />
                    {uploadData.file ? uploadData.file.name : 'Choose file'}
                  </Button>
                </div>
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  className="w-full gradient-primary"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                  Upload
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
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
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

        {/* Notes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover-lift">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base line-clamp-1">{note.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {note.profile?.full_name || 'Anonymous'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {note.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{note.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{note.course?.code || 'Unknown'}</Badge>
                  <Badge variant="outline">{formatFileSize(note.file_size)}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleLike(note.id, note.is_liked)}
                      className={note.is_liked ? 'text-destructive' : ''}
                    >
                      <Heart className={`w-4 h-4 mr-1 ${note.is_liked ? 'fill-current' : ''}`} />
                      {note.likes_count}
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {note.download_count || 0} downloads
                    </span>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a href={note.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notes found</h3>
            <p className="text-muted-foreground">Be the first to upload study notes!</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Notes;
