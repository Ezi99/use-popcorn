import { Children, useEffect, useState } from "react";
import { KEY } from "./config";
import NavBar from "./components/NavBar.js";
import NumResults from "./components/NumResults.js";
import Search from "./components/Search.js";
import Box from "./components/Box.js";
import MovieList from "./components/movie/MovieList.js";
import Main from "./components/Main.js";
import Loader from "./components/Loader.js";
import ErrorMessage from "./components/ErrorMessage.js";
import WatchedMovieSummary from "./components/movie/WatchedMovieSummary.js";
import WatchedMovieList from "./components/movie/WatchedMovieList.js";
import MovieDetails from "./components/movie/MovieDetails.js";

export default function App() {
  const [watched, setWatched] = useState(function () {
    const localWatched = localStorage.getItem("watched");
    const res = localWatched ? JSON.parse(localWatched) : [];
    return res;
  });
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedID, setSelectedID] = useState(null);

  function handleSelectMovie(id) {
    setSelectedID((selectedID) => (id === selectedID ? null : id));
  }

  function handleCloseMovie() {
    setSelectedID(null);
  }

  function handleAddWatched(watchedMovie) {
    setWatched((watched) => [...watched, watchedMovie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) =>
      watched.filter((watchedMovie) => watchedMovie.imdbID !== id)
    );
  }

  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
          );

          if (!res.ok) {
            throw new Error("something went wrong while fetching movies");
          }

          const data = await res.json();

          if (data.Response === "False") {
            throw new Error("Movie not found !");
          }

          handleCloseMovie();
          setMovies(data.Search);
        } catch (error) {
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 2) {
        setMovies([]);
        setError("");
        return;
      }

      fetchMovies();
    },
    [query]
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedID ? (
            <MovieDetails
              selectedID={selectedID}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watchedMovies={watched}
            />
          ) : (
            <>
              <WatchedMovieSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
