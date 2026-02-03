import actionImage from "@/assets/Images/action.png";
import eventImage from "@/assets/Images/event.jpg";
import movieImage from "@/assets/Images/movie.jpg";
import partyImage from "@/assets/Images/party.jpg";

const movies = [
  {
    title: "Neon Frontier",
    genre: "Action • Sci-fi",
    runtime: "2h 08m",
    rating: "9.3",
    showtimes: ["11:00", "14:30", "19:20"],
    tagline: "Now Playing",
    image: actionImage,
    cta: "Book 3D",
  },
  {
    title: "Midnight Legends",
    genre: "Fantasy • Adventure",
    runtime: "2h 12m",
    rating: "8.7",
    showtimes: ["12:40", "16:20", "21:10"],
    tagline: "Limited release",
    image: partyImage,
    cta: "Reserve seats",
  },
  {
    title: "Aurora Nights",
    genre: "Drama • Romance",
    runtime: "1h 55m",
    rating: "8.1",
    showtimes: ["10:20", "13:45", "17:50"],
    tagline: "Critically praised",
    image: eventImage,
    cta: "Select showtime",
  },
  {
    title: "Velvet Echoes",
    genre: "Mystery • Thriller",
    runtime: "2h 03m",
    rating: "8.9",
    showtimes: ["09:10", "15:00", "20:30"],
    tagline: "IMAX experience",
    image: movieImage,
    cta: "Grab tickets",
  },
];

export default function HomeMovies() {
  return (
    <section className="mt-10 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-slate-200/30 ring-1 ring-slate-100 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-amber-500">
            Cinema picks
          </p>
          <h3 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Fresh on-screen releases
          </h3>
        </div>
        <button
          type="button"
          className="rounded-full bg-slate-900 px-5 py-2 text-[13px] font-semibold uppercase tracking-wider text-white transition hover:bg-slate-800"
        >
          View all shows
        </button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {movies.map((movie) => (
          <article
            key={movie.title}
            className="flex h-full flex-col gap-3 rounded-3xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={movie.image}
                alt={movie.title}
                className="h-45 w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-3 left-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                {movie.tagline}
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-slate-500">
                <span className="capitalize">{movie.genre}</span>
                <span>{movie.runtime}</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">{movie.title}</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-600">
                  {movie.rating}★
                </span>
                <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">
                  {movie.showtimes.join(" • ")}
                </p>
              </div>
              <button
                type="button"
                className="mt-2 rounded-full bg-linear-to-r from-amber-500 to-orange-500 px-4 py-2 text-[13px] font-semibold uppercase tracking-wider text-white transition hover:opacity-90"
              >
                {movie.cta}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
