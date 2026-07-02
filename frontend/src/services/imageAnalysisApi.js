const API_URL =
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

/**
 * Отправляет изображение на backend для анализа.
 *
 * @param {File} file выбранное пользователем изображение
 * @param {number} colorCount количество цветовых кластеров
 * @returns {Promise<Object>} результат анализа
 */
export async function analyzeImage(file, colorCount = 8) {
  if (!(file instanceof File)) {
    throw new Error('Не выбран файл для анализа.');
  }

  const formData = new FormData();

  // Название "file" должно совпадать
  // с аргументом file в FastAPI endpoint.
  formData.append('file', file);

  let response;

  try {
    response = await fetch(
      `${API_URL}/api/analyze?colors=${encodeURIComponent(colorCount)}`,
      {
        method: 'POST',
        body: formData,
      },
    );
  } catch {
    throw new Error(
      'Не удалось подключиться к серверу анализа. Проверьте, запущен ли backend.',
    );
  }

  let responseData;

  try {
    responseData = await response.json();
  } catch {
    throw new Error(
      'Сервер вернул ответ в неизвестном формате.',
    );
  }

  if (!response.ok) {
    const errorDetail = responseData?.detail;

    if (typeof errorDetail === 'string') {
      throw new Error(errorDetail);
    }

    throw new Error(
      `Не удалось проанализировать изображение. Код ошибки: ${response.status}.`,
    );
  }

  return responseData;
}