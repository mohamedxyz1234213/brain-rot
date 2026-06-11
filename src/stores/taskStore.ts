import { create } from 'zustand';
import { Task } from '../services/backend/interface';
import { backendService } from '../services/backend';

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (userId: string, status?: Task['status']) => Promise<void>;
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (userId, status) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await backendService.getTasks(userId, status);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  createTask: async (task) => {
    try {
      const newTask = await backendService.createTask(task);
      set({ tasks: [...get().tasks, newTask] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateTask: async (taskId, data) => {
    try {
      const updated = await backendService.updateTask(taskId, data);
      set({
        tasks: get().tasks.map((t) => (t.id === taskId ? updated : t)),
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteTask: async (taskId) => {
    try {
      await backendService.deleteTask(taskId);
      set({ tasks: get().tasks.filter((t) => t.id !== taskId) });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  completeTask: async (taskId) => {
    try {
      const updated = await backendService.updateTask(taskId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      set({
        tasks: get().tasks.map((t) => (t.id === taskId ? updated : t)),
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
