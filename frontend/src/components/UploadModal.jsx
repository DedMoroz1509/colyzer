import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { mockAnalysisResult } from '../data/mockAnalysis.js';
import { validateImageFile } from '../utils/fileValidation.js';
import { formatFileSize } from '../utils/formatFileSize.js';

function UploadModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

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

  const handleClose = () => {
    setSelectedFile(null);
    setError('');
    onClose();
  };

  const handleAnalyze = () => {
    if (!selectedFile) {
      setError('Сначала выберите изображение.');
      return;
    }

    const fileForAnalysis = selectedFile;

    setSelectedFile(null);
    setError('');
    onClose();

    navigate('/analysis', {
      state: {
        file: fileForAnalysis,
        result: mockAnalysisResult,
      },
    });
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
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            handleClose();
          }
        }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          onMouseDown={(event) => event.stopPropagation()}
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
                  Выберите изображение и запустите анализ цветовой
                  гаммы.
                </p>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Закрыть"
                onClick={handleClose}
              />
            </div>

            <div className="modal-body">
              {!selectedFile && (
                <div className="upload-area text-center p-5">
                  <h3 className="fs-5">
                    Выберите изображение
                  </h3>

                  <p className="text-secondary">
                    Поддерживаются JPG, PNG и WEBP размером до 10 МБ.
                  </p>

                  <input
                    ref={inputRef}
                    type="file"
                    className="d-none"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                  />

                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => inputRef.current?.click()}
                  >
                    Выбрать файл
                  </button>
                </div>
              )}

              {selectedFile && (
                <div className="row g-4 align-items-center">
                  <div className="col-md-6">
                    <img
                      src={previewUrl}
                      className="upload-preview rounded"
                      alt={`Предварительный просмотр ${selectedFile.name}`}
                    />
                  </div>

                  <div className="col-md-6">
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
                      <dd>{selectedFile.type}</dd>
                    </dl>

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => inputRef.current?.click()}
                    >
                      Выбрать другое
                    </button>

                    <input
                      ref={inputRef}
                      type="file"
                      className="d-none"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div
                  className="alert alert-danger mt-3 mb-0"
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
                onClick={handleClose}
              >
                Отмена
              </button>

              <button
                type="button"
                className="btn btn-dark"
                disabled={!selectedFile}
                onClick={handleAnalyze}
              >
                Анализировать
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