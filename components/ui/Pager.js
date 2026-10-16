import { IconChevronLeft, IconChevronRight } from '@/components/icons';

// Contrôles "‹ 1/3 ›" des diaporamas, carrousels et grilles paginées.
export default function Pager({ page, total, onPrev, onNext, label = 'page' }) {
  if (total < 2) return null;
  return (
    <div className="flex items-center justify-center gap-5 text-[0.8rem] text-ink/75" role="group" aria-label={`Navigation ${label}`}>
      <button
        type="button"
        onClick={onPrev}
        disabled={page <= 1}
        className="flex h-11 w-11 items-center justify-center transition disabled:opacity-30"
        aria-label={`${label} précédente`}
      >
        <IconChevronLeft size={16} />
      </button>
      <span aria-live="polite" className="min-w-8 text-center tabular-nums">
        {page}/{total}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={page >= total}
        className="flex h-11 w-11 items-center justify-center transition disabled:opacity-30"
        aria-label={`${label} suivante`}
      >
        <IconChevronRight size={16} />
      </button>
    </div>
  );
}
