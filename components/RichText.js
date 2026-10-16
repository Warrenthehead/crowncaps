// Affiche un texte simple saisi dans l'admin :
//   **texte**  -> gras
//   - élément  -> liste à puces
//   ligne vide -> nouveau paragraphe
// Le texte n'est jamais injecté comme HTML : aucun risque de code malveillant.

function renderInline(text, keyPrefix) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

export default function RichText({ text, className = '' }) {
  if (!text) return null;
  const blocks = [];
  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'p', lines: paragraph });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: 'ul', lines: list });
      list = [];
    }
  };

  String(text)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .forEach((raw) => {
      const line = raw.trimEnd();
      if (/^\s*[-•]\s+/.test(line)) {
        flushParagraph();
        list.push(line.replace(/^\s*[-•]\s+/, ''));
      } else if (line.trim() === '') {
        flushParagraph();
        flushList();
      } else {
        flushList();
        paragraph.push(line);
      }
    });
  flushParagraph();
  flushList();

  return (
    <div className={`prose-shop ${className}`}>
      {blocks.map((block, b) =>
        block.type === 'ul' ? (
          <ul key={b}>
            {block.lines.map((l, i) => (
              <li key={i}>{renderInline(l, `${b}-${i}`)}</li>
            ))}
          </ul>
        ) : (
          <p key={b}>
            {block.lines.map((l, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {renderInline(l, `${b}-${i}`)}
              </span>
            ))}
          </p>
        )
      )}
    </div>
  );
}
