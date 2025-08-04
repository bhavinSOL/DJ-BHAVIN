import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Folder, FolderPlus, Edit, Trash2, Save, X, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  file_url: string;
  cover_image_url?: string;
  duration: number;
  like_count?: number;
  play_count?: number;
  category_id?: string;
}

interface CategoryManagerProps {
  songs: Song[];
  onSongUpdate: () => void;
}

export const CategoryManager = ({ songs, onSongUpdate }: CategoryManagerProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `category-${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('covers')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadFile(imageFile);
      }

      const { error } = await supabase
        .from('categories')
        .insert({
          name: createForm.name,
          description: createForm.description || null,
          image_url: imageUrl
        });

      if (error) throw error;

      toast({
        title: "Category created successfully!",
        description: createForm.name
      });

      setCreateForm({ name: '', description: '' });
      setImageFile(null);
      setShowCreateForm(false);
      await fetchCategories();
    } catch (error: any) {
      console.error('Create category error:', error);
      toast({
        title: "Failed to create category",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? Songs in this category will be uncategorized.')) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Category deleted successfully"
      });

      await fetchCategories();
      onSongUpdate(); // Refresh songs to show category changes
    } catch (error) {
      console.error('Delete category error:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
    }
  };

  const handleAssignSongToCategory = async (songId: string, categoryId: string | null) => {
    try {
      const { error } = await supabase
        .from('songs')
        .update({ category_id: categoryId })
        .eq('id', songId);

      if (error) throw error;

      toast({
        title: "Song category updated successfully"
      });

      onSongUpdate();
    } catch (error) {
      console.error('Update song category error:', error);
      toast({
        title: "Error",
        description: "Failed to update song category",
        variant: "destructive"
      });
    }
  };

  const getSongsInCategory = (categoryId: string) => {
    return songs.filter(song => song.category_id === categoryId);
  };

  const getUncategorizedSongs = () => {
    return songs.filter(song => !song.category_id);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Category Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Folder className="w-5 h-5" />
              Category Management
            </CardTitle>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant="outline"
              size="sm"
            >
              <FolderPlus className="w-4 h-4" />
              New Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <form onSubmit={handleCreateCategory} className="space-y-4 mb-6 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name *</Label>
                  <Input
                    id="categoryName"
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryImage">Category Image</Label>
                  <Input
                    id="categoryImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="bg-background"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-background"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="default" size="sm">
                  <Save className="w-4 h-4" />
                  Create Category
                </Button>
                <Button 
                  type="button" 
                  onClick={() => setShowCreateForm(false)}
                  variant="outline" 
                  size="sm"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Categories List */}
          <div className="space-y-4">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No categories created yet</p>
              </div>
            ) : (
              categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  songsCount={getSongsInCategory(category.id).length}
                  onDelete={() => handleDeleteCategory(category.id)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Song Assignment Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Assign Songs to Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {songs.map((song) => (
              <div key={song.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <img
                  src={song.cover_image_url || '/placeholder.svg'}
                  alt={song.title}
                  className="w-12 h-12 rounded-md object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{song.title}</h4>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </div>
                <div className="w-48">
                  <Select
                    value={song.category_id || 'uncategorized'}
                    onValueChange={(value) => 
                      handleAssignSongToCategory(
                        song.id, 
                        value === 'uncategorized' ? null : value
                      )
                    }
                  >
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uncategorized">Uncategorized</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface CategoryCardProps {
  category: Category;
  songsCount: number;
  onDelete: () => void;
}

const CategoryCard = ({ category, songsCount, onDelete }: CategoryCardProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
      <img
        src={category.image_url || '/placeholder.svg'}
        alt={category.name}
        className="w-16 h-16 rounded-md object-cover"
      />
      <div className="flex-1">
        <h3 className="font-semibold">{category.name}</h3>
        {category.description && (
          <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">
            {songsCount} {songsCount === 1 ? 'song' : 'songs'}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onDelete} variant="destructive" size="sm">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};