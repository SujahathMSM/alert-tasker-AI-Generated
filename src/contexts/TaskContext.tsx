
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, Priority, Status, Category } from '../models/Task';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface TaskContextType {
  tasks: Task[];
  categories: Category[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Sample categories
const defaultCategories: Category[] = [
  { id: '1', name: 'Work', color: '#3b82f6' },
  { id: '2', name: 'Personal', color: '#10b981' },
  { id: '3', name: 'Shopping', color: '#f59e0b' },
  { id: '4', name: 'Health', color: '#ef4444' },
];

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);

  // Load tasks from local storage on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const storedCategories = localStorage.getItem('categories');
    
    if (storedTasks) {
      // Parse and fix dates which come as strings from JSON
      const parsedTasks = JSON.parse(storedTasks) as Task[];
      setTasks(parsedTasks.map(task => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined
      })));
    }
    
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    }
  }, []);

  // Save tasks to local storage when they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save categories to local storage when they change
  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    toast.success('Task added successfully');
  };

  const updateTask = (id: string, updatedFields: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id 
          ? { ...task, ...updatedFields, updatedAt: new Date() } 
          : task
      )
    );
    toast.success('Task updated successfully');
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    toast.success('Task deleted successfully');
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: uuidv4(),
    };
    
    setCategories(prevCategories => [...prevCategories, newCategory]);
    toast.success('Category added successfully');
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === id 
          ? { ...category, ...updatedFields } 
          : category
      )
    );
    toast.success('Category updated successfully');
  };

  const deleteCategory = (id: string) => {
    // Remove category from tasks
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.categoryId === id 
          ? { ...task, categoryId: undefined } 
          : task
      )
    );
    
    // Remove category itself
    setCategories(prevCategories => 
      prevCategories.filter(category => category.id !== id)
    );
    
    toast.success('Category deleted successfully');
  };

  return (
    <TaskContext.Provider 
      value={{ 
        tasks, 
        categories,
        addTask, 
        updateTask, 
        deleteTask,
        addCategory,
        updateCategory,
        deleteCategory
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
