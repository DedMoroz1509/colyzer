from typing import Annotated

from fastapi import (
    FastAPI,
    File,
    HTTPException,
    Query,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware

from app.analyzer import (
    InvalidImageError,
    analyze_image_bytes,
)
from app.validation import read_and_validate_image


app = FastAPI(
    title="Colyzer API",
    version="0.1.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

"""
    Проверка доступности backend.
    """
@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze")
async def analyze_image(
    file: Annotated[
        UploadFile,
        File(description="Image to analyze"),
    ],
    colors: Annotated[
        int,
        Query(
            ge=2,
            le=20,
            description="Number of color clusters",
        ),
    ] = 8,
) -> dict[str, object]:
    """
    Анализирует изображение и возвращает
    основные группы цветов.
    """

    try:
        image_bytes = await read_and_validate_image(
            file
        )

        analysis_result = analyze_image_bytes(
            image_bytes=image_bytes,
            requested_color_count=colors,
        )

        return {
            "filename": file.filename,
            "content_type": file.content_type,
            **analysis_result,
        }

    except InvalidImageError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error),
        ) from error

    finally:
        await file.close()