export function formatFileSize(sizeInBytes) {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} Б`;
  }

  const sizeInKilobytes = sizeInBytes / 1024;

  if (sizeInKilobytes < 1024) {
    return `${sizeInKilobytes.toFixed(1)} КБ`;
  }

  const sizeInMegabytes = sizeInKilobytes / 1024;

  return `${sizeInMegabytes.toFixed(1)} МБ`;
}