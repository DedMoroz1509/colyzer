const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateImageFile(file) {
  if (!file) {
    return 'Изображение не выбрано.';
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Поддерживаются только изображения JPG, PNG и WEBP.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'Размер изображения не должен превышать 10 МБ.';
  }

  return null;
}