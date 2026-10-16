// Sélecteurs de taille et de couleur : pastilles à bordure dorée (style "TL Beige").
export default function OptionPicker({ label, options, value, onChange, error, type = 'size' }) {
  if (!options.length) return null;
  const selectedName = options.find((o) => o.id === value)?.[type === 'color' ? 'name' : 'label'];
  return (
    <fieldset className="mt-6">
      <legend className="mb-2.5 text-[0.85rem] tracking-[0.06em]">
        {label}
        {selectedName && <span className="text-muted"> : {selectedName}</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.id === value;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              aria-pressed={on}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.9rem] tracking-[0.04em] transition ${
                on ? 'border-navy bg-navy text-white' : 'border-gold text-navy hover:bg-gold/10'
              }`}
            >
              {type === 'color' && (
                <span className="h-4 w-4 rounded-full ring-1 ring-black/15" style={{ background: o.hex }} aria-hidden="true" />
              )}
              {type === 'color' ? o.name : o.label}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 text-[0.85rem] text-danger" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
