import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  comment: string;
  username: string;
  created_at: string;
  song_id: string;
}

interface CommentsSectionProps {
  songId: string;
  onClose: () => void;
}

const CommentsSection = ({ songId, onClose }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [username, setUsername] = useState('Anonymous');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [songId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('song_id', songId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive"
      });
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          song_id: songId,
          comment: newComment.trim(),
          username: username.trim() || 'Anonymous'
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments();
      toast({
        title: "Comment posted successfully!"
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments
          </CardTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Add Comment Form */}
          <div className="space-y-3 p-4 bg-muted rounded-lg">
            <Input
              placeholder="Your name (optional)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-background"
            />
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="bg-background resize-none"
              rows={3}
            />
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isLoading}
              variant="music"
              className="w-full"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>

          {/* Comments List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 bg-muted rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-foreground">
                      {comment.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {comment.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentsSection;