import { useEffect, useState } from "react";
import Loader from "../Loader";
import ErrorMessage from "../ErrorMessage";
import StarRating from "../StarRating";
import { KEY } from "../../config";
import { useKeyDown } from "../../useKeyDown";

export default function MovieDetails({
  selectedID,
  onCloseMovie,
  onAddWatched,
  watchedMovies,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState("");

  const isWatched = watchedMovies.find(
    (watchedMovie) => watchedMovie.imdbID === movie.imdbID
  );

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAddToList() {
    const newWatchedMovIe = {
      imdbID: selectedID,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovIe);
    onCloseMovie();
  }

  useEffect(
    function () {
      const controller = new AbortController();

      async function fetchMovieDetails() {
        try {
          setIsLoading(true);
          setError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedID}`,
            { signal: controller.signal }
          );

          if (!res.ok) {
            throw new Error("something went wrong while fetching movies");
          }

          const data = await res.json();

          if (data.Response === "False") {
            throw new Error("Movie not found !");
          }

          setMovie(data);
        } catch (error) {
          if (error.name !== "AbortError") {
            setError(error.message);
          }
        } finally {
          setIsLoading(false);
        }
      }

      fetchMovieDetails();

      return () => controller.abort();
    },
    [selectedID]
  );

  useKeyDown("Escape", onCloseMovie);

  useEffect(
    function () {
      if (!title) return;
      document.title = "Movie | " + title;

      return () => (document.title = "usePopcorn");
    },
    [title]
  );

  return (
    <div className="details">
      {isLoading && <Loader />}
      {!isLoading && !error && (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAddToList}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated this movie{" "}
                  {
                    watchedMovies.find(
                      (watchedMovie) => movie.imdbID === watchedMovie.imdbID
                    ).userRating
                  }
                  <span>🌟</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
      {error && <ErrorMessage message={error} />}
    </div>
  );
}
