
import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskProvider, useTaskContext } from '../contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Task, Status } from '../models/Task';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import {
  Plus,
  CalendarDays,
  Search,
  ListFilter,
  Grid2X2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const TaskManager: React.FC = () => {
  const { tasks, categories } = useTaskContext();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'board' | 'category' | 'calendar'>('board');
  
  // Get filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      const matchesSearch = 
        searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Priority filter
      const matchesPriority = 
        filterPriority === 'all' || 
        task.priority === filterPriority;
      
      // Category filter
      const matchesCategory = 
        filterCategory === 'all' || 
        (filterCategory === 'none' && !task.categoryId) ||
        task.categoryId === filterCategory;
      
      return matchesSearch && matchesPriority && matchesCategory;
    });
  }, [tasks, searchQuery, filterPriority, filterCategory]);
  
  // Group tasks by status, category or date
  const groupedTasks = useMemo(() => {
    if (viewMode === 'board') {
      // Group by status
      return {
        todo: filteredTasks.filter(t => t.status === 'todo'),
        'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
        completed: filteredTasks.filter(t => t.status === 'completed'),
      };
    } else if (viewMode === 'category') {
      // Group by category
      const result: Record<string, Task[]> = { 'none': [] };
      
      // First, add all categories to ensure they appear even if empty
      categories.forEach(cat => {
        result[cat.id] = [];
      });
      
      // Then populate with tasks
      filteredTasks.forEach(task => {
        const categoryId = task.categoryId || 'none';
        if (!result[categoryId]) {
          result[categoryId] = [];
        }
        result[categoryId].push(task);
      });
      
      return result;
    } else {
      // Group by date
      const result: Record<string, Task[]> = { 
        'overdue': [],
        'today': [], 
        'tomorrow': [], 
        'upcoming': [], 
        'no-date': [] 
      };
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      filteredTasks.forEach(task => {
        if (!task.dueDate) {
          result['no-date'].push(task);
        } else {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          
          if (dueDate < today && task.status !== 'completed') {
            result['overdue'].push(task);
          } else if (dueDate.getTime() === today.getTime()) {
            result['today'].push(task);
          } else if (dueDate.getTime() === tomorrow.getTime()) {
            result['tomorrow'].push(task);
          } else {
            result['upcoming'].push(task);
          }
        }
      });
      
      return result;
    }
  }, [filteredTasks, categories, viewMode]);
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsAddDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setTimeout(() => setEditingTask(undefined), 300); // Reset after animation
  };
  
  // Helper function to get column titles
  const getColumnTitle = (key: string): string => {
    if (viewMode === 'board') {
      const titles: Record<Status, string> = {
        'todo': 'To Do',
        'in-progress': 'In Progress',
        'completed': 'Completed'
      };
      return titles[key as Status];
    } else if (viewMode === 'category') {
      if (key === 'none') return 'Uncategorized';
      const category = categories.find(c => c.id === key);
      return category ? category.name : key;
    } else {
      const titles: Record<string, string> = {
        'overdue': 'Overdue',
        'today': 'Today',
        'tomorrow': 'Tomorrow',
        'upcoming': 'Upcoming',
        'no-date': 'No Due Date'
      };
      return titles[key];
    }
  };
  
  // Helper function to get column style for category view
  const getColumnStyle = (key: string) => {
    if (viewMode === 'category' && key !== 'none') {
      const category = categories.find(c => c.id === key);
      if (category) {
        return {
          borderTopColor: category.color,
          borderTopWidth: '3px'
        };
      }
    } else if (viewMode === 'calendar') {
      const colors: Record<string, string> = {
        'overdue': '#ef4444',
        'today': '#3b82f6',
        'tomorrow': '#10b981',
        'upcoming': '#8b5cf6',
        'no-date': '#6b7280'
      };
      return {
        borderTopColor: colors[key] || '#e5e7eb',
        borderTopWidth: '3px'
      };
    }
    return {};
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Task Manager</h1>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add Task</span>
          </Button>
        </div>
      </header>
      
      <main className="container py-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
              <TabsList>
                <TabsTrigger value="board">
                  <ListFilter className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Status</span>
                </TabsTrigger>
                <TabsTrigger value="category">
                  <Grid2X2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Category</span>
                </TabsTrigger>
                <TabsTrigger value="calendar">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Calendar</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1 rounded-full text-sm bg-secondary border-none"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1 rounded-full text-sm bg-secondary border-none"
          >
            <option value="all">All Categories</option>
            <option value="none">Uncategorized</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(groupedTasks).map(([key, tasks]) => (
            <div
              key={key}
              className={cn(
                "bg-card rounded-xl border shadow-sm",
                tasks.length === 0 ? "border-dashed" : ""
              )}
              style={getColumnStyle(key)}
            >
              <div className="p-4 border-b">
                <h2 className="font-medium text-lg">{getColumnTitle(key)}</h2>
                <p className="text-sm text-muted-foreground">
                  {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="p-3 space-y-3 min-h-[100px]">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                    />
                  ))
                ) : (
                  <div className="h-24 flex items-center justify-center text-muted-foreground text-sm italic">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            onSubmit={handleCloseDialog}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Index = () => (
  <TaskProvider>
    <TaskManager />
  </TaskProvider>
);

export default Index;
