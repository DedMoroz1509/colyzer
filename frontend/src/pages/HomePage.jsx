import { useState } from 'react';

import Header from '../components/Header.jsx';
import UploadModal from '../components/UploadModal.jsx';
import ExampleCard from '../components/ExampleCard.jsx';

import { mockExamples } from '../data/mockExamples.js';

function HomePage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <>
      <Header
        onOpenUploader={() => setIsUploadOpen(true)}
      />

      <main>
        <section className="hero-section">
          <div className="container text-center py-5">
            <p className="text-uppercase text-secondary small fw-semibold">
              Инструмент для художников и дизайнеров
            </p>

            <h1 className="display-5 fw-bold mx-auto hero-section__title">
              Определите цветовую палитру изображения
            </h1>

            <p className="lead text-secondary mx-auto hero-section__description">
              Загрузите изображение и получите основные оттенки,
              HEX- и RGB-коды, а также процентное содержание
              каждого цвета.
            </p>

            <button
              type="button"
              className="btn btn-dark btn-lg mt-3"
              onClick={() => setIsUploadOpen(true)}
            >
              Проанализировать изображение
            </button>
          </div>
        </section>

        <section className="container py-5">
          <div className="mb-4">
            <h2 className="fw-bold">Примеры анализа</h2>

            <p className="text-secondary mb-0">
              Так может выглядеть результат обработки изображения.
            </p>
          </div>

          <div className="row g-4">
            {mockExamples.map((example) => (
              <div
                key={example.id}
                className="col-12 col-lg-6"
              >
                <ExampleCard example={example} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </>
  );
}

export default HomePage;