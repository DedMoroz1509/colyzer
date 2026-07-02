from fastapi import HTTPException, UploadFile


ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 МБ


async def read_and_validate_image(file: UploadFile) -> bytes:


    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Файл не выбран.",
        )

    content_type = (file.content_type or "").lower()

    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Поддерживаются только изображения JPG, PNG и WEBP.",
        )

    
    image_bytes = await file.read(MAX_FILE_SIZE + 1)

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Загруженный файл пуст.",
        )

    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Размер изображения не должен превышать 10 МБ.",
        )

    return image_bytes