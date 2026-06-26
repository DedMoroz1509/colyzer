import { Link } from 'react-router';

function Header({ onOpenUploader }) {
  return (
    <header className="app-header bg-white border-bottom">
      <div className="container app-header__inner">
        <Link
          to="/"
          className="app-header__logo text-decoration-none"
        >
          Colyzer
        </Link>

        <button
          type="button"
          className="btn btn-dark app-header__upload"
          onClick={onOpenUploader}
        >
          Добавить изображение
        </button>

        <div className="app-header__placeholder" />
      </div>
    </header>
  );
}

export default Header;