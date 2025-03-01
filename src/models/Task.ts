
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  priority: Priority;
  status: Status;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}
