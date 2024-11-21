import React, { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const API_URL = "https://movie-catalogue-backend.vercel.app/api/movies";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [currentMovieId, setCurrentMovieId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleFileChange = (e) => setImage(e.target.files[0]);

  const validateInputs = () => {
    if (!title || !description || !genre || !rating || !releaseDate) {
      alert("All fields except the image are required!");
      return false;
    }
    return true;
  };

  const createMovie = async () => {
    if (!validateInputs()) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("genre", genre);
    formData.append("rating", rating);
    formData.append("releaseDate", releaseDate);

    try {
      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMovies([...movies, response.data]);
      clearForm();
    } catch (error) {
      console.error("Error creating movie:", error);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await axios.get(API_URL);
      setMovies(response.data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleSort = (e) => setSortBy(e.target.value);

  const handleEdit = (movie) => {
    setTitle(movie.title);
    setDescription(movie.description);
    setImage(movie.imageUrl);
    setGenre(movie.genre);
    setRating(movie.rating);
    setReleaseDate(movie.releaseDate);
    setCurrentMovieId(movie._id);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("image", image);
    formData.append("genre", genre);
    formData.append("rating", rating);
    formData.append("releaseDate", releaseDate);

    try {
      const response = await axios.put(
        `${API_URL}/${currentMovieId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMovies(
        movies.map((movie) =>
          movie._id === currentMovieId ? response.data : movie
        )
      );
      clearForm();
    } catch (error) {
      console.error("Error saving movie:", error);
    }
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setImage(null);
    setGenre("");
    setRating("");
    setReleaseDate("");
    setCurrentMovieId(null);
    setIsEditing(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMovies(movies.filter((movie) => movie._id !== id));
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase()) ||
      movie.genre.toLowerCase().includes(search.toLowerCase())
  );

  const sortedMovies = filteredMovies.sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "genre") return a.genre.localeCompare(b.genre);
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="app-container p-5 max-w-7xl mx-auto">
      <h1 className="text-center text-2xl font-bold mb-5">Movie Catalog</h1>

      <div className="search-sort mb-5 flex flex-col sm:flex-row justify-between gap-3">
        <input
          type="text"
          placeholder="Search by title or genre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered input-sm w-full sm:w-2/5"
        />
        <select
          onChange={handleSort}
          value={sortBy}
          className="select select-bordered select-sm w-full sm:w-1/5"
        >
          <option value="">Sort By</option>
          <option value="title">Title</option>
          <option value="genre">Genre</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <div className="form card bg-base-100 shadow-lg p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered input-sm w-full"
          />
          <input
            type="text"
            placeholder="Genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="input input-bordered input-sm w-full"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="textarea textarea-bordered textarea-sm w-full sm:col-span-2"
          />
          <input
            type="number"
            placeholder="Rating (0-10)"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="input input-bordered input-sm w-full"
          />
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            className="input input-bordered input-sm w-full"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input file-input-bordered file-input-sm w-full"
          />
        </div>
        <div className="flex justify-end gap-3 mt-3">
          {isEditing ? (
            <>
              <button className="btn btn-success btn-sm" onClick={handleSave}>
                Save
              </button>
              <button
                className="btn btn-error btn-sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={createMovie}>
              Add Movie
            </button>
          )}
        </div>
      </div>

      <div className="movies-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedMovies.length > 0 ? (
          sortedMovies.map((movie) => (
            <div
              key={movie._id}
              className="movie-card card bg-base-100 shadow-lg p-3"
            >
              <img
                src={movie.imageUrl}
                alt={movie.title}
                className="w-full h-48 object-cover mb-2 rounded-md"
              />
              <h2 className="text-lg font-bold">{movie.title}</h2>
              <p>{movie.description}</p>
              <p>Genre: {movie.genre}</p>
              <p>Rating: {movie.rating}</p>
              <p>
                Release Date:{" "}
                {new Date(movie.releaseDate).toLocaleDateString()}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleEdit(movie)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => handleDelete(movie._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No movies match your search.</p>
        )}
      </div>
    </div>
  );
};

export default App;

