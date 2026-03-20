export function LoadingState({ label = "正在加载..." }: { label?: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[28px] border border-dashed border-[#ebdbcf] bg-white/70 p-6 text-sm font-medium text-slate-500">
      <div className="flex items-center gap-3">
        <span className="h-3 w-3 animate-pulse rounded-full bg-[#ef8f84]" />
        {label}
      </div>
    </div>
  );
}
