import { useState } from 'react';

function PaletteResult({ result }) {
  const [copiedColor, setCopiedColor] = useState('');

  const handleCopy = async (hex) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedColor(hex);

      window.setTimeout(() => {
        setCopiedColor('');
      }, 1500);
    } catch {
      setCopiedColor('');
    }
  };

  return (
    <section>
      <div className="mb-4">
        <h1 className="fw-bold mb-2">
          Результат анализа
        </h1>

        <p className="text-secondary mb-0">
          Основные оттенки и их доля на изображении.
        </p>
      </div>

      <div className="d-flex flex-column gap-3">
        {result.colors.map((color) => {
          const rgbText = [
            color.rgb.red,
            color.rgb.green,
            color.rgb.blue,
          ].join(', ');

          return (
            <article
              key={color.hex}
              className="color-result border rounded-3 p-3"
            >
              <div
                className="color-result__sample"
                style={{ backgroundColor: color.hex }}
              />

              <div className="color-result__information">
                <div className="d-flex justify-content-between gap-3">
                  <div>
                    <strong className="d-block">
                      {color.hex}
                    </strong>

                    <span className="text-secondary small">
                      RGB: {rgbText}
                    </span>
                  </div>

                  <strong>
                    {color.percentage.toFixed(1)}%
                  </strong>
                </div>

                <div
                  className="progress mt-3"
                  role="progressbar"
                  aria-valuenow={color.percentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                >
                  <div
                    className="progress-bar"
                    style={{
                      width: `${color.percentage}%`,
                      backgroundColor: color.hex,
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => handleCopy(color.hex)}
              >
                {copiedColor === color.hex
                  ? 'Скопировано'
                  : 'Копировать'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default PaletteResult;