/**
 * 任务执行包装器 - 将任意异步函数包装为可持久化的任务
 */
import taskManager from './TaskManager';

export interface RunTaskOptions {
  /** 任务类型 */
  type: string;
  /** 任务描述 */
  description: string;
  /** 是否允许恢复（默认 true） */
  allowResume?: boolean;
  /** 生成检查点数据的函数（返回当前状态） */
  getCheckpoint?: () => Promise<any> | any;
  /** 实际要执行的异步函数，接收检查点数据作为参数 */
  fn: (checkpointData?: any) => Promise<any>;
  /** 任务元数据 */
  metadata?: Record<string, any>;
}

/**
 * 运行一个可恢复的任务
 * @example
 * const { taskId, result } = await runTask({
 *   type: 'build',
 *   description: 'Release APK build',
 *   getCheckpoint: () => ({ step: 'gradle-assemble' }),
 *   fn: async (cp) => { return build(); }
 * });
 *
 * 注意: 检查点会自动保存，不需要指定间隔。
 */
export async function runTask<T>(options: RunTaskOptions): Promise<{ taskId: string; result: T }> {
  const manager = taskManager;
  const { task, result } = await manager.runTask<T>({
    type: options.type,
    description: options.description,
    allowResume: options.allowResume,
    metadata: options.metadata,
    checkpointFn: options.getCheckpoint,
    run: async (checkpointData) => {
      return options.fn(checkpointData);
    },
  });

  return { taskId: task.id, result }; // result 是 fn 的返回值
}

export default runTask;
