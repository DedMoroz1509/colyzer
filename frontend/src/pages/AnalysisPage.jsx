import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';

import Header from '../components/Header.jsx';
import UploadModal from '../components/UploadModal.jsx';
import PaletteResult from '../components/PaletteResult.jsx';

function AnalysisPage() {
  const location = useLocation();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const file = location.state?.file;
  const result = location.state?.result;

  useEffect(() => {
    if (!file) {
      setImageUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <>
      <Header
        onOpenUploader={() => setIsUploadOpen(true)}
      />

      <main className="container py-5">
        {!file || !result ? (
          <div className="alert alert-warning">
            <h1 className="fs-4">
              Данные анализа отсутствуют
            </h1>

            <p>
              Вернитесь на главную страницу и загрузите изображение
              заново.
            </p>

            <Link to="/" className="btn btn-dark">
              На главную
            </Link>
          </div>
        ) : (
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
                    {file.name}
                  </strong>

                  <span className="text-secondary small">
                    Исходное изображение
                  </span>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <PaletteResult result={result} />
            </div>
          </div>
        )}
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </>
  );
}

export default AnalysisPage;