
import React, { useState } from 'react';
import { TaskProvider, useTaskContext } from '../contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Edit, Plus, Trash } from 'lucide-react';
import { Category } from '../models/Task';
import { Link } from 'react-router-dom';

interface CategoryFormProps {
  category?: Category;
  onSubmit: () => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel }) => {
  const { addCategory, updateCategory } = useTaskContext();
  
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#3b82f6');

  const colorOptions = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#6b7280', // gray
    '#000000', // black
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }
    
    if (category) {
      updateCategory(category.id, { name, color });
    } else {
      addCategory({ name, color });
    }
    
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category-name">Category Name</Label>
        <Input
          id="category-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
          required
          autoFocus
        />
      </div>
      
      <div className="space-y-2">
        <Label>Category Color</Label>
        <div className="grid grid-cols-8 gap-2">
          {colorOptions.map((c) => (
            <button
              key={c}
              type="button"
              className={`h-8 w-8 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{category ? 'Update Category' : 'Add Category'}</Button>
      </div>
    </form>
  );
};

const CategoryManager: React.FC = () => {
  const { categories, deleteCategory } = useTaskContext();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => setEditingCategory(undefined), 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="container py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Categories</h1>
            <p className="text-muted-foreground">Manage your task categories</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/">Back to Tasks</Link>
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Category
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="bg-card border rounded-xl p-4 flex items-center justify-between animate-fade-in"
              style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center">
                <div 
                  className="h-4 w-4 rounded-full mr-3" 
                  style={{ backgroundColor: category.color }} 
                />
                <span className="font-medium">{category.name}</span>
              </div>
              
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleEditCategory(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => deleteCategory(category.id)}
                  className="hover:text-destructive"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {categories.length === 0 && (
            <div className="col-span-full bg-muted/50 rounded-xl p-8 text-center text-muted-foreground">
              <p>No categories yet. Create your first category to organize your tasks.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm
            category={editingCategory}
            onSubmit={handleCloseDialog}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Categories = () => (
  <TaskProvider>
    <CategoryManager />
  </TaskProvider>
);

export default Categories;
