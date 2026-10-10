import { useState, useRef } from 'react';
import { BookOpen, Film, Plus, ImagePlus, Star, Trash2 } from 'lucide-react';

const INITIAL_BOOKS = [
  {
    id: 1,
    title: 'O Hobbit',
    author: 'J.R.R. Tolkien',
    progress: 64,
    status: 'cap. 14 de 19',
    cover: null,
  },
  {
    id: 2,
    title: 'Hábitos Atômicos',
    author: 'James Clear',
    progress: 30,
    status: 'cap. 4 de 15',
    cover: null,
  },
];

const INITIAL_MOVIES = [
  {
    id: 101,
    title: 'Duna: Parte 2',
    director: 'Denis Villeneuve',
    rating: 5,
    cover: null,
  },
  {
    id: 102,
    title: 'Interstellar',
    director: 'Christopher Nolan',
    rating: 5,
    cover: null,
  },
  {
    id: 103,
    title: 'O Passageiro',
    director: 'Jaume Collet-Serra',
    rating: 4,
    cover: null,
  },
];

export default function ShelvesContent({
  // When provided externally (from App), use those. Otherwise, manage internally.
  books: externalBooks,
  movies: externalMovies,
  onBooksChange,
  onMoviesChange,
  defaultTab = 'books',
  onRequestAdd,    // (type: 'book'|'film') => void — opens the Add modal
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [internalBooks, setInternalBooks] = useState(INITIAL_BOOKS);
  const [internalMovies, setInternalMovies] = useState(INITIAL_MOVIES);

  const books = externalBooks !== undefined ? externalBooks : internalBooks;
  const movies = externalMovies !== undefined ? externalMovies : internalMovies;

  const setBooks = (fn) => {
    const next = typeof fn === 'function' ? fn(books) : fn;
    if (onBooksChange) onBooksChange(next);
    else setInternalBooks(next);
  };
  const setMovies = (fn) => {
    const next = typeof fn === 'function' ? fn(movies) : fn;
    if (onMoviesChange) onMoviesChange(next);
    else setInternalMovies(next);
  };

  // File upload for book/movie cover
  const handleCoverUpload = (id, type, file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'book') {
        setBooks(prev => prev.map(b => b.id === id ? { ...b, cover: e.target.result } : b));
      } else {
        setMovies(prev => prev.map(m => m.id === id ? { ...m, cover: e.target.result } : m));
      }
    };
    reader.readAsDataURL(file);
  };

  const addBook = () => {
    if (onRequestAdd) {
      onRequestAdd('book');
    } else {
      const title = prompt('Título do livro:');
      if (!title) return;
      const author = prompt('Autor: ') || 'Desconhecido';
      setBooks(prev => [...prev, {
        id: Date.now(), title, author, progress: 0, status: 'Para ler', cover: null,
      }]);
    }
  };

  const addMovie = () => {
    if (onRequestAdd) {
      onRequestAdd('film');
    } else {
      const title = prompt('Título do filme:');
      if (!title) return;
      setMovies(prev => [...prev, {
        id: Date.now(), title, director: 'Cinema', rating: 5, cover: null,
      }]);
    }
  };

  const removeBook = (id) => setBooks(prev => prev.filter(b => b.id !== id));
  const removeMovie = (id) => setMovies(prev => prev.filter(m => m.id !== id));

  return (
    <div className="shelves-widget">
      {/* Tab Switcher */}
      <div className="shelves-tabs">
        <button
          className={`shelves-tab${activeTab === 'books' ? ' active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          <BookOpen size={13} />
          <span>Livros ({books.length})</span>
        </button>
        <button
          className={`shelves-tab${activeTab === 'movies' ? ' active' : ''}`}
          onClick={() => setActiveTab('movies')}
        >
          <Film size={13} />
          <span>Filmes ({movies.length})</span>
        </button>
      </div>

      {/* BOOKS VIEW */}
      {activeTab === 'books' && (
        <div className="shelves-grid">
          {books.map(book => (
            <div key={book.id} className="shelf-card">
              {/* Cover or Placeholder */}
              <label className="shelf-cover-wrap" title="Clique para adicionar/trocar capa">
                <input
                  type="file"
                  accept="image/*"
                  className="shelf-cover-input"
                  onChange={e => handleCoverUpload(book.id, 'book', e.target.files[0])}
                />
                {book.cover ? (
                  <img src={book.cover} alt={book.title} className="shelf-cover-img" />
                ) : (
                  <div className="shelf-cover-placeholder">
                    <BookOpen size={20} className="shelf-placeholder-icon" />
                    <span className="shelf-placeholder-label">+ Capa</span>
                  </div>
                )}
              </label>

              {/* Book Info */}
              <div className="shelf-info">
                <div className="shelf-title">{book.title}</div>
                <div className="shelf-sub">{book.author}</div>
                <div className="progress-bar" style={{ marginTop: 'var(--space-2)' }}>
                  <div className="progress-bar__fill" style={{ width: `${book.progress}%` }} />
                </div>
                <div className="shelf-meta">{book.progress}% · {book.status}</div>
              </div>

              <button
                className="shelf-remove-btn"
                onClick={() => removeBook(book.id)}
                title="Remover livro"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}

          <button className="shelf-add-btn" onClick={addBook}>
            <Plus size={14} />
            <span>Adicionar Livro</span>
          </button>
        </div>
      )}

      {/* MOVIES VIEW */}
      {activeTab === 'movies' && (
        <div className="shelves-grid">
          {movies.map(movie => (
            <div key={movie.id} className="shelf-card">
              {/* Poster or Placeholder */}
              <label className="shelf-cover-wrap" title="Clique para adicionar/trocar pôster">
                <input
                  type="file"
                  accept="image/*"
                  className="shelf-cover-input"
                  onChange={e => handleCoverUpload(movie.id, 'movie', e.target.files[0])}
                />
                {movie.cover ? (
                  <img src={movie.cover} alt={movie.title} className="shelf-cover-img" />
                ) : (
                  <div className="shelf-cover-placeholder shelf-cover-placeholder--movie">
                    <Film size={20} className="shelf-placeholder-icon" />
                    <span className="shelf-placeholder-label">+ Pôster</span>
                  </div>
                )}
              </label>

              {/* Movie Info */}
              <div className="shelf-info">
                <div className="shelf-title">{movie.title}</div>
                <div className="shelf-sub">{movie.director}</div>
                <div className="shelf-stars" style={{ marginTop: 4 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      style={{
                        color: star <= movie.rating ? 'var(--color-accent)' : 'var(--color-outline)',
                        fontSize: 12,
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <button
                className="shelf-remove-btn"
                onClick={() => removeMovie(movie.id)}
                title="Remover filme"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}

          <button className="shelf-add-btn" onClick={addMovie}>
            <Plus size={14} />
            <span>Adicionar Filme</span>
          </button>
        </div>
      )}
    </div>
  );
}
