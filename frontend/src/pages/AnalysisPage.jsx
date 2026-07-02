import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';

import Header from '../components/Header.jsx';
import PaletteResult from '../components/PaletteResult.jsx';
import UploadModal from '../components/UploadModal.jsx';

function AnalysisPage() {
  const location = useLocation();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const file = location.state?.file;
  const result = location.state?.result;

  useEffect(() => {
    if (!(file instanceof File)) {
      setImageUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const hasAnalysis =
    file instanceof File
    && result
    && Array.isArray(result.colors);

  return (
    <>
      <Header
        onOpenUploader={() => {
          setIsUploadOpen(true);
        }}
      />

      <main className="container py-5">
        {!hasAnalysis ? (
          <div className="alert alert-warning">
            <h1 className="fs-4">
              Данные анализа отсутствуют
            </h1>

            <p className="mb-3">
              Возможно, страница была обновлена напрямую.
              Вернитесь на главную страницу и загрузите
              изображение заново.
            </p>

            <div className="d-flex flex-wrap gap-2">
              <Link
                to="/"
                className="btn btn-dark"
              >
                На главную
              </Link>

              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => {
                  setIsUploadOpen(true);
                }}
              >
                Загрузить изображение
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
              <div>
                <p className="text-secondary mb-1">
                  Анализ выполнен
                </p>

                <h1 className="fs-3 fw-bold mb-0">
                  {result.filename || file.name}
                </h1>
              </div>

              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => {
                  setIsUploadOpen(true);
                }}
              >
                Анализировать другое изображение
              </button>
            </div>

            <div className="row g-5 align-items-start">
              <div className="col-12 col-lg-6">
                <div className="analysis-image-card bg-white border rounded-4 p-3">
                  <img
                    src={imageUrl}
                    className="analysis-image"
                    alt={`Анализируемое изображение ${file.name}`}
                  />

                  <div className="mt-3">
                    <strong className="d-block text-break">
                      {result.filename || file.name}
                    </strong>

                    <span className="text-secondary small">
                      Исходное изображение
                    </span>

                    <div className="d-flex flex-column gap-1 mt-3 text-secondary small">
                      {typeof result.width === 'number'
                        && typeof result.height === 'number' && (
                          <span>
                            Размер изображения:{' '}
                            {result.width} × {result.height}
                          </span>
                        )}

                      {typeof result.color_count === 'number' && (
                        <span>
                          Групп оттенков:{' '}
                          {result.color_count}
                        </span>
                      )}

                      {typeof result.analyzed_pixel_count
                        === 'number' && (
                          <span>
                            Проанализировано пикселей:{' '}
                            {result.analyzed_pixel_count
                              .toLocaleString('ru-RU')}
                          </span>
                        )}

                      {result.content_type && (
                        <span>
                          Формат: {result.content_type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-lg-6">
                <PaletteResult result={result} />
              </div>
            </div>
          </>
        )}
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setIsUploadOpen(false);
        }}
      />
    </>
  );
}

export default AnalysisPage;