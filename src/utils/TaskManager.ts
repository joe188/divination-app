/**
 * TaskManager - 任务持久化与恢复系统
 * 参考 MemOS 思想，防止会话重启导致进度丢失
 */

import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export type TaskStatus = 'running' | 'paused' | 'completed' | 'failed';

export interface TaskCheckpoint {
  /** 检查点数据（任意可序列化对象） */
  data: any;
  /** 检查点创建时间 */
  createdAt: number;
  /** 描述 */
  description?: string;
}

export interface Task {
  /** 任务唯一 ID */
  id: string;
  /** 任务类型：build, bundle, analysis, query, custom... */
  type: string;
  /** 人类可读描述 */
  description: string;
  /** 当前状态 */
  status: TaskStatus;
  /** 进度 0-100 */
  progress: number;
  /** 创建时间戳 */
  createdAt: number;
  /** 最后更新时间 */
  updatedAt: number;
  /** 完成时间（如果已完成） */
  completedAt?: number;
  /** 关联的产物路径（如 APK 文件） */
  artifacts?: string[];
  /** 检查点文件路径（如果有） */
  checkpointFile?: string;
  /** 错误信息（如果失败） */
  error?: string;
  /** 是否允许恢复 */
  allowResume: boolean;
  /** 自定义元数据 */
  metadata?: Record<string, any>;
}

class TaskManager {
  private static instance: TaskManager;
  private baseDir: string;
  private activeDir: string;
  private completedDir: string;
  private checkpointDir: string;

  private constructor(basePath: string) {
    this.baseDir = basePath;
    this.activeDir = path.join(basePath, 'tasks', 'active');
    this.completedDir = path.join(basePath, 'tasks', 'completed');
    this.checkpointDir = path.join(basePath, 'tasks', 'checkpoint');
  }

  static getInstance(basePath?: string): TaskManager {
    if (!TaskManager.instance) {
      const path = basePath || process.cwd();
      TaskManager.instance = new TaskManager(path);
    }
    return TaskManager.instance;
  }

  /** 生成任务文件路径 */
  private taskPath(taskId: string, dir: string): string {
    return path.join(dir, `${taskId}.json`);
  }

  /** 创建新任务 */
  async createTask(params: {
    type: string;
    description: string;
    allowResume?: boolean;
    metadata?: Record<string, any>;
  }): Promise<Task> {
    const now = Date.now();
    const task: Task = {
      id: uuidv4(),
      type: params.type,
      description: params.description,
      status: 'running',
      progress: 0,
      createdAt: now,
      updatedAt: now,
      allowResume: params.allowResume ?? false,
      metadata: params.metadata,
    };

    await this.saveTask(task, this.activeDir);
    return task;
  }

  /** 保存任务到指定目录 */
  private async saveTask(task: Task, dir: string): Promise<void> {
    const filePath = this.taskPath(task.id, dir);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(task, null, 2), 'utf-8');
  }

  /** 读取任务 */
  async loadTask(taskId: string, dir: string): Promise<Task | null> {
    const filePath = this.taskPath(taskId, dir);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as Task;
    } catch {
      return null;
    }
  }

  /** 列出目录中的所有任务 */
  async listTasks(dir: string): Promise<Task[]> {
    try {
      const files = await fs.readdir(dir);
      const tasks: Task[] = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          const taskId = path.basename(file, '.json');
          const task = await this.loadTask(taskId, dir);
          if (task) tasks.push(task);
        }
      }
      return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  /** 更新任务（保留文件位置） */
  async updateTask(task: Partial<Task> & { id: string }): Promise<void> {
    // 先尝试从 active 读取，如果不在则从 completed 读取
    let existing = await this.loadTask(task.id, this.activeDir);
    const dir = existing ? this.activeDir : this.completedDir;

    if (!existing) {
      existing = await this.loadTask(task.id, this.completedDir);
    }

    if (!existing) {
      throw new Error(`Task ${task.id} not found`);
    }

    const updated: Task = {
      ...existing,
      ...task,
      updatedAt: Date.now(),
    };

    await this.saveTask(updated, dir);
  }

  /** 完成任务，移动到 completed 目录 */
  async completeTask(taskId: string, artifacts?: string[]): Promise<void> {
    const task = await this.loadTask(taskId, this.activeDir);
    if (!task) {
      throw new Error(`Task ${taskId} not found in active tasks`);
    }

    task.status = 'completed';
    task.progress = 100;
    task.completedAt = Date.now();
    if (artifacts) task.artifacts = artifacts;

    await this.saveTask(task, this.completedDir);
    // Remove from active
    const activePath = this.taskPath(taskId, this.activeDir);
    await fs.unlink(activePath).catch(() => {});
  }

  /** 标记任务失败 */
  async failTask(taskId: string, error: string): Promise<void> {
    const task = await this.loadTask(taskId, this.activeDir);
    if (!task) {
      throw new Error(`Task ${taskId} not found in active tasks`);
    }

    task.status = 'failed';
    task.error = error;
    task.completedAt = Date.now();

    await this.saveTask(task, this.completedDir);
    const activePath = this.taskPath(taskId, this.activeDir);
    await fs.unlink(activePath).catch(() => {});
  }

  /** 更新进度 */
  async updateProgress(taskId: string, progress: number): Promise<void> {
    await this.updateTask({
      id: taskId,
      progress: Math.min(100, Math.max(0, progress)),
    });
  }

  /** 创建检查点 */
  async createCheckpoint(
    taskId: string,
    data: any,
    description?: string
  ): Promise<string> {
    const checkpointFile = path.join(
      this.checkpointDir,
      `${taskId}-${Date.now()}.json`
    );

    await fs.mkdir(this.checkpointDir, { recursive: true });
    await fs.writeFile(
      checkpointFile,
      JSON.stringify(
        {
          taskId,
          createdAt: Date.now(),
          description,
          data,
        },
        null,
        2
      ),
      'utf-8'
    );

    await this.updateTask({
      id: taskId,
      checkpointFile,
    });

    return checkpointFile;
  }

  /** 读取最新检查点 */
  async getLatestCheckpoint(taskId: string): Promise<TaskCheckpoint | null> {
    const files = await fs.readdir(this.checkpointDir);
    const taskFiles = files
      .filter(f => f.startsWith(taskId) && f.endsWith('.json'))
      .map(f => path.join(this.checkpointDir, f))
      .sort(); // simple lexical sort by timestamp in filename

    if (taskFiles.length === 0) return null;

    const latest = taskFiles[taskFiles.length - 1];
    const content = await fs.readFile(latest, 'utf-8');
    return JSON.parse(content) as TaskCheckpoint;
  }

  /** 运行一个可恢复的任务 */
  async runTask<T>(params: {
    type: string;
    description: string;
    allowResume?: boolean;
    checkpointInterval?: number; // ms (optional)
    checkpointFn?: () => any;
    run: (checkpointData?: any) => Promise<T>;
    metadata?: Record<string, any>;
  }): Promise<{ task: Task; result: T }> {
    // 1. 创建任务记录
    const task = await this.createTask({
      type: params.type,
      description: params.description,
      allowResume: params.allowResume ?? true,
    });

    try {
      // 2. 检查是否有可用的检查点
      let checkpointData: any = null;
      if (params.allowResume && params.checkpointFn) {
        const cp = await this.getLatestCheckpoint(task.id);
        if (cp) {
          checkpointData = cp.data;
        }
      }

      // 3. 运行任务（传入检查点数据）
      const result = await params.run(checkpointData);

      // 4. 完成任务
      await this.completeTask(task.id);

      return { task, result };
    } catch (error: any) {
      await this.failTask(task.id, error.message || String(error));
      throw error;
    }
  }

  /** 获取所有活跃任务 */
  async getActiveTasks(): Promise<Task[]> {
    return this.listTasks(this.activeDir);
  }

  /** 获取最近完成的任务 */
  async getRecentCompleted(limit: number = 10): Promise<Task[]> {
    const all = await this.listTasks(this.completedDir);
    return all.slice(0, limit);
  }

  /** 清理旧的检查点文件（保留最近N个） */
  async pruneCheckpoints(taskId: string, keepCount: number = 5): Promise<void> {
    const files = await fs.readdir(this.checkpointDir);
    const taskFiles = files
      .filter(f => f.startsWith(taskId) && f.endsWith('.json'))
      .map(f => path.join(this.checkpointDir, f))
      .sort();

    if (taskFiles.length > keepCount) {
      const toDelete = taskFiles.slice(0, taskFiles.length - keepCount);
      for (const file of toDelete) {
        await fs.unlink(file).catch(() => {});
      }
    }
  }
}

export default TaskManager.getInstance();
