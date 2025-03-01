
import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { Task, Priority, Status } from '../models/Task';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  task?: Task;
  onSubmit: () => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSubmit, onCancel }) => {
  const { addTask, updateTask, categories } = useTaskContext();
  
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [status, setStatus] = useState<Status>(task?.status || 'todo');
  const [dueDate, setDueDate] = useState<Date | undefined>(task?.dueDate);
  const [categoryId, setCategoryId] = useState<string | undefined>(task?.categoryId);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    // Focus the title input when the form is opened
    const titleInput = document.getElementById('task-title');
    if (titleInput) {
      titleInput.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }
    
    if (task) {
      // Update existing task
      updateTask(task.id, {
        title,
        description: description || undefined,
        priority,
        status,
        dueDate,
        categoryId
      });
    } else {
      // Create new task
      addTask({
        title,
        description: description || undefined,
        priority,
        status,
        dueDate,
        categoryId
      });
    }
    
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="task-title">Task Title</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          required
          className="transition-all duration-200"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="task-description">Description (Optional)</Label>
        <Textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description"
          className="resize-none transition-all duration-200"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <RadioGroup 
            value={priority} 
            onValueChange={(value) => setPriority(value as Priority)}
            className="flex space-x-2"
          >
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="low" id="low" />
              <Label htmlFor="low" className="text-blue-600 dark:text-blue-400">Low</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="medium" id="medium" />
              <Label htmlFor="medium" className="text-amber-600 dark:text-amber-400">Medium</Label>
            </div>
            <div className="flex items-center space-x-1">
              <RadioGroupItem value="high" id="high" />
              <Label htmlFor="high" className="text-red-600 dark:text-red-400">High</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as Status)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Due Date (Optional)</Label>
          <div className="flex space-x-2">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            {dueDate && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDueDate(undefined)}
                className="hover:text-destructive"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Category (Optional)</Label>
          <Select 
            value={categoryId || ""} 
            onValueChange={(value) => setCategoryId(value || undefined)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{task ? 'Update Task' : 'Add Task'}</Button>
      </div>
    </form>
  );
};

export default TaskForm;
