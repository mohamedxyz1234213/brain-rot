import { create } from 'zustand';
import { Task } from '../services/backend/interface';
import { persist } from '../lib/persistence';

type TaskTab = 'today' | 'upcoming' | 'completed' | 'abandoned';

interface TaskState {
  tasks: Task[];
  activeTab: TaskTab;
  isLoading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'postponeCount' | 'status'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  abandonTask: (id: string) => void;
  postponeTask: (id: string) => void;
  setActiveTab: (tab: TaskTab) => void;
  getFilteredTasks: () => Task[];
  getEatTheFrogTask: () => Task | undefined;
  getTaskUnlockerTasks: () => Task[];
  clearError: () => void;
}

const generateId = () => `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useTaskStore = create<TaskState>()(
  persist(
    {
      name: 'tasks',
      partialize: (state: any) => ({
        tasks: state.tasks,
        activeTab: state.activeTab,
      }),
    },
    (set, get) => ({
      tasks: [],
      activeTab: 'today',
      isLoading: false,
      error: null,

      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: generateId(),
          postponeCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'pending',
          isEatTheFrog: taskData.isEatTheFrog ?? false,
          isAppUnlocker: taskData.isAppUnlocker ?? false,
          isRecurring: taskData.isRecurring ?? false,
          priority: taskData.priority ?? 'medium',
        };
        set({ tasks: [...get().tasks, task] });
      },

      updateTask: (id, data) => {
        set({
          tasks: get().tasks.map((t: Task) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          ),
        });
      },

      deleteTask: (id) => {
        set({ tasks: get().tasks.filter((t: Task) => t.id !== id) });
      },

      completeTask: (id) => {
        set({
          tasks: get().tasks.map((t: Task) =>
            t.id === id
              ? { ...t, status: 'completed', completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : t
          ),
        });
      },

      abandonTask: (id) => {
        set({
          tasks: get().tasks.map((t: Task) =>
            t.id === id ? { ...t, status: 'abandoned', updatedAt: new Date().toISOString() } : t
          ),
        });
      },

      postponeTask: (id) => {
        set({
          tasks: get().tasks.map((t: Task) =>
            t.id === id
              ? {
                  ...t,
                  postponeCount: t.postponeCount + 1,
                  isEatTheFrog: t.postponeCount + 1 >= 3 ? true : t.isEatTheFrog,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        });
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      getFilteredTasks: () => {
        const { tasks, activeTab } = get();
        const today = new Date().toISOString().split('T')[0];
        switch (activeTab) {
          case 'today':
            return tasks.filter((t: Task) =>
              t.status === 'pending' && (!t.dueDate || t.dueDate.startsWith(today))
            );
          case 'upcoming':
            return tasks.filter((t: Task) => t.status === 'pending' && t.dueDate && !t.dueDate.startsWith(today));
          case 'completed':
            return tasks.filter((t: Task) => t.status === 'completed');
          case 'abandoned':
            return tasks.filter((t: Task) => t.status === 'abandoned');
          default:
            return tasks;
        }
      },

      getEatTheFrogTask: () => {
        return get().tasks.find((t: Task) => t.isEatTheFrog && t.status === 'pending');
      },

      getTaskUnlockerTasks: () => {
        return get().tasks.filter((t: Task) => t.isAppUnlocker && t.status === 'pending');
      },

      clearError: () => {
        set({ error: null });
      },
    })
  )
);
