-- 创建任务表
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    result JSONB,
    error TEXT
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at);

-- 启用行级安全策略 (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有操作（在生产环境中应该更严格）
CREATE POLICY "Allow all operations on tasks" ON public.tasks
    FOR ALL USING (true) WITH CHECK (true);

-- 或者更安全的策略（如果有用户认证）：
-- CREATE POLICY "Users can manage their own tasks" ON public.tasks
--     FOR ALL USING (auth.uid()::text = user_id) WITH CHECK (auth.uid()::text = user_id);

-- 创建自动清理过期任务的函数
CREATE OR REPLACE FUNCTION public.cleanup_expired_tasks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.tasks 
    WHERE created_at < NOW() - INTERVAL '24 hours';
    
    RAISE LOG 'Cleaned up expired tasks older than 24 hours';
END;
$$;

-- 创建定时任务清理过期数据（需要 pg_cron 扩展）
-- 注意：这需要在 Supabase 项目中启用 pg_cron 扩展
-- SELECT cron.schedule('cleanup-expired-tasks', '0 */6 * * *', 'SELECT public.cleanup_expired_tasks();');

-- 授权给 authenticated 和 anon 角色
GRANT ALL ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO anon;

-- 如果需要，也可以授权给 service_role
GRANT ALL ON public.tasks TO service_role;

-- 创建一个视图来查看任务统计
CREATE OR REPLACE VIEW public.task_stats AS
SELECT 
    status,
    COUNT(*) as count,
    MIN(created_at) as oldest_task,
    MAX(created_at) as newest_task
FROM public.tasks 
GROUP BY status;

-- 授权视图访问
GRANT SELECT ON public.task_stats TO authenticated;
GRANT SELECT ON public.task_stats TO anon;
GRANT SELECT ON public.task_stats TO service_role; 