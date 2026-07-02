from io import BytesIO

import numpy as np
from PIL import Image, UnidentifiedImageError
from sklearn.cluster import KMeans


# Максимальное количество пикселей используемых непосредственно для обучения K-means.
MAX_TRAINING_PIXELS = 100_000

# Количество пикселей, обрабатываемых за один проход при расчёте итоговых процентов.
PREDICTION_BATCH_SIZE = 250_000

# Почти полностью прозрачные пиксели не учитываем.
MIN_VISIBLE_ALPHA = 10


class InvalidImageError(ValueError):
    """
    Ошибка обработки изображения.
    """


def prepare_image(
    image_bytes: bytes,
) -> tuple[np.ndarray, int, int]:
    

    try:
        with Image.open(BytesIO(image_bytes)) as image:
            
            image.load()

            original_width, original_height = image.size

            if original_width <= 0 or original_height <= 0:
                raise InvalidImageError(
                    "Изображение имеет некорректный размер."
                )

            # RGBA нужен, чтобы учитывать прозрачность PNG и WEBP.
            rgba_image = image.convert("RGBA")

           
            rgba_pixels = np.asarray(
                rgba_image,
                dtype=np.uint8,
            )

    except InvalidImageError:
        raise

    except (UnidentifiedImageError, OSError) as error:
        raise InvalidImageError(
            "Файл повреждён или не является изображением."
        ) from error

    # Преобразуем:
    # (высота, ширина, 4) в (количество пикселей, 4).
    flat_pixels = rgba_pixels.reshape(-1, 4)

    # Убираем прозрачные пиксели.
    visible_pixels = flat_pixels[
        flat_pixels[:, 3] > MIN_VISIBLE_ALPHA
    ]

    if len(visible_pixels) == 0:
        raise InvalidImageError(
            "Изображение не содержит видимых пикселей."
        )

    
    rgb_pixels = visible_pixels[:, :3]

    return (
        rgb_pixels,
        original_width,
        original_height,
    )


def select_training_pixels(
    pixels: np.ndarray,
    max_pixels: int = MAX_TRAINING_PIXELS,
) -> np.ndarray:
    # в зависимости от размера выбираем кол-во пикселей для обучения

    if len(pixels) <= max_pixels:
        return pixels

    random_generator = np.random.default_rng(seed=42)

    selected_indexes = random_generator.choice(
        len(pixels),
        size=max_pixels,
        replace=False,
    )

    return pixels[selected_indexes]


def count_cluster_pixels(
    model: KMeans,
    pixels: np.ndarray,
    cluster_count: int,
) -> np.ndarray:
    

    cluster_counts = np.zeros(
        cluster_count,
        dtype=np.int64,
    )

    for start_index in range(
        0,
        len(pixels),
        PREDICTION_BATCH_SIZE,
    ):
        end_index = start_index + PREDICTION_BATCH_SIZE

        pixel_batch = pixels[start_index:end_index]

        labels = model.predict(
            pixel_batch.astype(np.float32)
        )

        batch_counts = np.bincount(
            labels,
            minlength=cluster_count,
        )

        cluster_counts += batch_counts

    return cluster_counts


def extract_dominant_colors(
    pixels: np.ndarray,
    requested_color_count: int,
) -> list[dict[str, int | float]]:
    """
    Выделяет основные группы цветов методом K-means
    и рассчитывает долю каждой группы.
    """

    if requested_color_count < 2:
        raise ValueError(
            "Количество цветов должно быть не меньше двух."
        )

    training_pixels = select_training_pixels(pixels)

    # Проверяем количество реально различных цветов.
    unique_training_colors = np.unique(
        training_pixels,
        axis=0,
    )

    cluster_count = min(
        requested_color_count,
        len(unique_training_colors),
    )

    if cluster_count < 1:
        raise InvalidImageError(
            "Не удалось определить цвета изображения."
        )

    model = KMeans(
        n_clusters=cluster_count,
        init="k-means++",
        n_init=10,
        random_state=42,
    )

    model.fit(
        training_pixels.astype(np.float32)
    )

    cluster_counts = count_cluster_pixels(
        model=model,
        pixels=pixels,
        cluster_count=cluster_count,
    )

    # Центр каждого кластера является средним RGB-цветом.
    cluster_centers = np.rint(
        model.cluster_centers_
    ).astype(int)

    cluster_centers = np.clip(
        cluster_centers,
        0,
        255,
    )

    total_pixel_count = len(pixels)

    colors = []

    for cluster_index in range(cluster_count):
        red, green, blue = cluster_centers[cluster_index]

        pixel_count = int(
            cluster_counts[cluster_index]
        )

        percentage = (
            pixel_count / total_pixel_count * 100
        )

        colors.append(
            {
                "red": int(red),
                "green": int(green),
                "blue": int(blue),
                "pixel_count": pixel_count,
                "percentage": round(
                    float(percentage),
                    2,
                ),
            }
        )

    # Сначала самые распространённые цвета.
    colors.sort(
        key=lambda color: color["percentage"],
        reverse=True,
    )

    return colors


def rgb_to_hex(
    red: int,
    green: int,
    blue: int,
) -> str:
    

    return f"#{red:02X}{green:02X}{blue:02X}"


def analyze_image_bytes(
    image_bytes: bytes,
    requested_color_count: int = 8,
) -> dict[str, object]:
    """
    Выполняет полный анализ изображения.
    """

    pixels, width, height = prepare_image(
        image_bytes
    )

    dominant_colors = extract_dominant_colors(
        pixels=pixels,
        requested_color_count=requested_color_count,
    )

    result_colors = []

    for color in dominant_colors:
        red = int(color["red"])
        green = int(color["green"])
        blue = int(color["blue"])

        result_colors.append(
            {
                "hex": rgb_to_hex(
                    red=red,
                    green=green,
                    blue=blue,
                ),
                "rgb": {
                    "red": red,
                    "green": green,
                    "blue": blue,
                },
                "pixel_count": color["pixel_count"],
                "percentage": color["percentage"],
            }
        )

    return {
        "width": width,
        "height": height,
        "analyzed_pixel_count": len(pixels),
        "color_count": len(result_colors),
        "colors": result_colors,
    }