"use client";
type ModalProps = {
  title: string;
  body: string;
  onClose: () => void;
};
export function Modal({ title, body, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center" onKeyDown={(e) => e.key === "Escape" && onClose()} tabIndex={-1}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade" onClick={onClose} />
      <div className="relative z-10 w-[92vw] max-w-xl rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl p-6 opacity-100 scale-100 transition">
        <h3 className="m-0 text-xl md:text-2xl font-bold">{title}</h3>
        <pre className="whitespace-pre-wrap mt-3 text-slate-100/90">{body}</pre>
        <div className="flex justify-end mt-5">
          <button className="btn-primary-lg" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
