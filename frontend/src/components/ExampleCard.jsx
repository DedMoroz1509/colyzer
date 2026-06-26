function ExampleCard({ example }) {
  return (
    <article className="card h-100 border-0 shadow-sm">
      <img
        src={example.imageUrl}
        className="card-img-top example-card__image"
        alt={example.title}
      />

      <div className="card-body">
        <h3 className="card-title fs-5">
          {example.title}
        </h3>

        <p className="text-secondary">
          Основные оттенки изображения
        </p>

        <div className="d-flex gap-2 mb-4">
          {example.colors.map((color) => (
            <div
              key={color.hex}
              className="example-color"
              style={{ backgroundColor: color.hex }}
              title={color.hex}
            />
          ))}
        </div>

        <div className="d-flex flex-column gap-2">
          {example.colors.map((color) => (
            <div
              key={color.hex}
              className="d-flex justify-content-between"
            >
              <span>{color.hex}</span>
              <span className="text-secondary">
                {color.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

export default ExampleCard;