
import React from 'react';
import { Task, Priority } from '../models/Task';
import { useTaskContext } from '../contexts/TaskContext';
import { format } from 'date-fns';
import { CheckCircle, Circle, Clock, Edit, Trash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

const priorityClasses: Record<Priority, string> = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
};

const statusIcons = {
  'todo': <Circle className="h-4 w-4" />,
  'in-progress': <Clock className="h-4 w-4 text-amber-500" />,
  'completed': <CheckCircle className="h-4 w-4 text-green-500" />
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit }) => {
  const { updateTask, deleteTask, categories } = useTaskContext();
  
  const category = categories.find(c => c.id === task.categoryId);
  
  const toggleStatus = () => {
    const nextStatus = 
      task.status === 'todo' ? 'in-progress' : 
      task.status === 'in-progress' ? 'completed' : 
      'todo';
    
    updateTask(task.id, { status: nextStatus });
  };

  return (
    <div 
      className={cn(
        "group relative p-4 rounded-xl border border-border bg-card animate-fade-in",
        task.status === 'completed' ? 'opacity-70' : ''
      )}
    >
      <div className="flex items-start gap-3">
        <button 
          onClick={toggleStatus}
          className="mt-1 flex-shrink-0 transition-transform duration-200 hover:scale-110"
          aria-label={`Mark as ${task.status === 'todo' ? 'in progress' : task.status === 'in-progress' ? 'completed' : 'todo'}`}
        >
          {statusIcons[task.status]}
        </button>
        
        <div className="flex-grow min-w-0">
          <div className="flex gap-2 mb-2 flex-wrap">
            {category && (
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${category.color}25`, color: category.color }}
              >
                {category.name}
              </span>
            )}
            
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
              priorityClasses[task.priority]
            )}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
          
          <h3 className={cn(
            "font-medium mb-1 text-base",
            task.status === 'completed' ? 'line-through text-muted-foreground' : ''
          )}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {task.description}
            </p>
          )}
          
          {task.dueDate && (
            <div className="text-xs flex items-center text-muted-foreground mt-2">
              <Clock className="h-3 w-3 mr-1" />
              Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute right-3 top-3 flex opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(task)}
          className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Edit task"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button 
          onClick={() => deleteTask(task.id)}
          className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors ml-1"
          aria-label="Delete task"
        >
          <Trash className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
