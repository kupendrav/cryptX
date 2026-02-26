"use client";
type ModalProps = {
  title: string;
  body: string;
  onClose: () => void;
};
export function Modal({ title, body, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" onKeyDown={(e) => e.key === "Escape" && onClose()} tabIndex={-1}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-fade" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl p-5 sm:p-8 opacity-100 scale-100 transition">
        <h3 className="m-0 text-2xl sm:text-3xl font-bold">{title}</h3>
        <pre className="whitespace-pre-wrap mt-3 sm:mt-4 text-slate-100/90 text-sm sm:text-base">{body}</pre>
        <div className="flex justify-end mt-4 sm:mt-6">
          <button className="btn-primary-lg text-sm sm:text-base px-5 py-2 sm:py-2.5" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
