import { useEffect, useState } from "react";
import StarRating from "./StarRating";
// const tempMovieData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt0133093",
//     Title: "The Matrix",
//     Year: "1999",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
//   },
//   {
//     imdbID: "tt6751668",
//     Title: "Parasite",
//     Year: "2019",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
//   },
// ];

// const tempWatchedData = [
//   {
//     imdbID: "tt1375666",
//     Title: "Inception",
//     Year: "2010",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
//     runtime: 148,
//     imdbRating: 8.8,
//     userRating: 10,
//   },
//   {
//     imdbID: "tt0088763",
//     Title: "Back to the Future",
//     Year: "1985",
//     Poster:
//       "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
//     runtime: 116,
//     imdbRating: 8.5,
//     userRating: 9,
//   },
// ];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// APP /////////////////////////////////
const API_KEY = "65942981";
export default function App() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  function selectMovie(id) {
    setSelectedId(id);
  }

  function onCloseWatched() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watchedMovie) => [...watchedMovie, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Esc" || event.keyCode === 27) {
      onCloseWatched();
    }
  });
  useEffect(
    function () {
      const controller = new AbortController();
      async function searchMovies() {
        if (query.length <= 3) return;
        setIsLoading(true);
        setError("");
        try {
          const response = await fetch(
            `http://www.omdbapi.com/?i=tt3896198&apikey=${API_KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!response.ok) throw new Error("Something Went wrong");
          const data = await response.json();
          if (data.Response === "False") throw new Error("Movie not found");
          setMovies(data.Search);
          setIsLoading(false);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err.message);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      searchMovies();

      return function () {
        controller.abort();
      };
    },
    [query]
  );

  return (
    <>
      <Navbar query={query} setQuery={setQuery} movies={movies} />
      <main className="main">
        <Box>
          {isLoading && <Loading />}
          {!isLoading && !error && (
            <MoviesList onSelectMovie={selectMovie} movies={movies} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              isLoading={isLoading}
              onAddWatched={handleAddWatched}
              onCloseWatched={onCloseWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary
                watched={watched}
                avgImdbRating={avgImdbRating}
                avgRuntime={avgRuntime}
                avgUserRating={avgUserRating}
              />
              <WatchedList
                watched={watched}
                handleDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </main>
    </>
  );
}
// APP /////////////////////////////////

// Loading Component ///////////////////////////////////
function Loading() {
  return <div className="loader">Loading⏳</div>;
}
// Loading Component ///////////////////////////////////

// Error Message //////////////////////////////////////

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}

// Error Message //////////////////////////////////////

// HEADER AREA /////////////////////////////////////////
function Navbar({ query, setQuery, movies }) {
  return (
    <nav className="nav-bar">
      <Logo />
      <NavSearch setQuery={setQuery} query={query} />
      <Results movies={movies} />
    </nav>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function NavSearch({ setQuery, query }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function Results({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

// HEADER AREA /////////////////////////////////////////

// BOX ////////////////////////////////////////////////
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
// BOX ////////////////////////////////////////////////

// MOVIES LIST ///////////////////////////////////////

function MoviesList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie onSelectMovie={onSelectMovie} movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}
// MOVIES LIST ///////////////////////////////////////

// MOVIE COMPONENT //////////////////////////////////
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
// MOVIE COMPONENT //////////////////////////////////

// Watched Summary /////////////////////////////////

function WatchedSummary({ watched, avgImdbRating, avgUserRating, avgRuntime }) {
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{Math.ceil(watched.length)} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{Math.ceil(avgImdbRating)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{Math.ceil(avgUserRating)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Math.ceil(avgRuntime)} min</span>
        </p>
      </div>
    </div>
  );
}

// Watched Summary /////////////////////////////////

// Watched List ///////////////////////////////////
function WatchedList({ watched, handleDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => {
        return (
          <WatchedMovie
            handleDeleteWatched={handleDeleteWatched}
            movie={movie}
            key={movie.imdbID}
          />
        );
      })}
    </ul>
  );
}
// Watched List ///////////////////////////////////
// Watched Movie ///////////////////////////////////

function WatchedMovie({ movie, handleDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.Title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{Math.ceil(movie.imdbRating)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{Math.ceil(movie.userRating)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{Math.ceil(movie.runtime)} min</span>
        </p>
      </div>
      <button
        className="btn-delete"
        onClick={() => handleDeleteWatched(movie.imdbID)}
      >
        X
      </button>
    </li>
  );
}

// Watched Movie ///////////////////////////////////

// Movie Details //////////////////////////////////

function MovieDetails({ selectedId, onAddWatched, onCloseWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedMovieRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;
  function handleAdd() {
    const newMovie = {
      imdbID: selectedId,
      imdbRating: Number(imdbRating),
      title,
      year,
      poster,
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };
    onAddWatched(newMovie);
    onCloseWatched();
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${API_KEY}&i=${selectedId}`
        );
        const data = await response.json();
        setMovie(data);
      }
      getMovieDetails();
    },
    [selectedId]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;
      return function () {
        document.title = "usePopcorn🍿";
      };
    },
    [title, selectedId]
  );

  return (
    <div className="details">
      <header>
        <button className="btn-back" onClick={onCloseWatched}>
          &larr;
        </button>
        <img src={poster} alt={`Poster for ${title} Movie`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>{runtime}</p>
          <p>{genre}</p>
          <p>
            <span>⭐</span>
            {imdbRating} IMDB Rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          {!isWatched ? (
            <>
              <StarRating
                size={24}
                maxRating={10}
                onSetRating={setUserRating}
              />
              {userRating > 0 && (
                <button className="btn-add" onClick={() => handleAdd()}>
                  + Add To Watched List
                </button>
              )}
            </>
          ) : (
            <p>You Rated This Movie With {watchedMovieRating}⭐</p>
          )}
        </div>
        <p>{plot}</p>
        <p>{director}</p>
        <p>{actors}</p>
      </section>
    </div>
  );
}
// Movie Details //////////////////////////////////
