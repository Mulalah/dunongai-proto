export default function LoadingSpinner({ message, size = 32 }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <span
        className="inline-block rounded-full border-[3px] border-teal/20 border-t-teal animate-spin"
        style={{ width: size, height: size }}
      />
      {message && <div className="text-sm text-slate-500 font-body">{message}</div>}
    </div>
  );
}
