import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { analyzeImage } from '../services/imageAnalysisApi.js';
import { validateImageFile } from '../utils/fileValidation.js';
import { formatFileSize } from '../utils/formatFileSize.js';

function UploadModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [colorCount, setColorCount] = useState(8);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const processFile = (file) => {
    const validationError = validateImageFile(file);

    if (validationError) {
      setSelectedFile(null);
      setError(validationError);
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      processFile(file);
    }
    event.target.value = '';
  };

  const resetAndClose = () => {
    setSelectedFile(null);
    setError('');
    setIsAnalyzing(false);
    setColorCount(8);

    onClose();
  };

  const handleClose = () => {
    if (isAnalyzing) {
      return;
    }

    resetAndClose();
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Сначала выберите изображение.');
      return;
    }

    if (isAnalyzing) {
      return;
    }

    setError('');
    setIsAnalyzing(true);

    const analyzedFile = selectedFile;

    try {
      const result = await analyzeImage(
        analyzedFile,
        colorCount,
      );

      resetAndClose();

      navigate('/analysis', {
        state: {
          file: analyzedFile,
          result,
        },
      });
    } catch (requestError) {
      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : 'Во время анализа произошла неизвестная ошибка.';

      setError(errorMessage);
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        aria-busy={isAnalyzing}
        onMouseDown={(event) => {
          const clickedBackdrop =
            event.target === event.currentTarget;

          if (!isAnalyzing && clickedBackdrop) {
            handleClose();
          }
        }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h2
                  id="upload-modal-title"
                  className="modal-title fs-5"
                >
                  Добавление изображения
                </h2>

                <p className="text-secondary small mb-0 mt-1">
                  Выберите изображение и запустите анализ
                  цветовой гаммы.
                </p>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Закрыть"
                disabled={isAnalyzing}
                onClick={handleClose}
              />
            </div>

            <div className="modal-body">
              
              <input
                ref={inputRef}
                type="file"
                className="d-none"
                accept="image/jpeg,image/png,image/webp"
                disabled={isAnalyzing}
                onChange={handleFileChange}
              />

              {!selectedFile && (
                <div className="upload-area text-center p-5">
                  <h3 className="fs-5">
                    Выберите изображение
                  </h3>

                  <p className="text-secondary">
                    Поддерживаются JPG, PNG и WEBP
                    размером до 10 МБ.
                  </p>

                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    disabled={isAnalyzing}
                    onClick={() => {
                      inputRef.current?.click();
                    }}
                  >
                    Выбрать файл
                  </button>
                </div>
              )}

              {selectedFile && (
                <div className="row g-4 align-items-center">
                  <div className="col-12 col-md-6">
                    <img
                      src={previewUrl}
                      className="upload-preview rounded"
                      alt={`Предварительный просмотр ${selectedFile.name}`}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <h3 className="fs-5 mb-3">
                      Изображение выбрано
                    </h3>

                    <dl className="mb-4">
                      <dt>Название</dt>
                      <dd className="text-break">
                        {selectedFile.name}
                      </dd>

                      <dt>Размер</dt>
                      <dd>
                        {formatFileSize(selectedFile.size)}
                      </dd>

                      <dt>Формат</dt>
                      <dd>
                        {selectedFile.type || 'Не определён'}
                      </dd>
                    </dl>

                    <div className="mb-4">
                      <label
                        htmlFor="color-count"
                        className="form-label fw-semibold"
                      >
                        Количество групп оттенков
                      </label>

                      <select
                        id="color-count"
                        className="form-select"
                        value={colorCount}
                        disabled={isAnalyzing}
                        onChange={(event) => {
                          setColorCount(
                            Number(event.target.value),
                          );
                        }}
                      >
                        <option value={4}>
                          4 оттенка
                        </option>

                        <option value={6}>
                          6 оттенков
                        </option>

                        <option value={8}>
                          8 оттенков
                        </option>

                        <option value={10}>
                          10 оттенков
                        </option>

                        <option value={12}>
                          12 оттенков
                        </option>

                        <option value={16}>
                          16 оттенков
                        </option>

                        <option value={20}>
                          20 оттенков
                        </option>
                      </select>

                      <div className="form-text">
                        Чем больше значение, тем подробнее
                        будет полученная палитра.
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      disabled={isAnalyzing}
                      onClick={() => {
                        inputRef.current?.click();
                      }}
                    >
                      Выбрать другое изображение
                    </button>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div
                  className="alert alert-info mt-4 mb-0"
                  role="status"
                >
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="spinner-border spinner-border-sm"
                      aria-hidden="true"
                    />

                    <span>
                      Изображение отправлено на сервер.
                      Выполняется анализ цветовой гаммы…
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div
                  className="alert alert-danger mt-4 mb-0"
                  role="alert"
                >
                  {error}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={isAnalyzing}
                onClick={handleClose}
              >
                Отмена
              </button>

              <button
                type="button"
                className="btn btn-dark"
                disabled={!selectedFile || isAnalyzing}
                onClick={handleAnalyze}
              >
                {isAnalyzing && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    aria-hidden="true"
                  />
                )}

                {isAnalyzing
                  ? 'Выполняется анализ...'
                  : 'Анализировать'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>
  );
}

export default UploadModal;