import React from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner'
import MovieCard from './components/MovieCard'
import { useDebounce } from 'react-use'
import { useState ,useEffect} from 'react'
import { getTrendingMovies, updateSearchCount } from './appwrite'
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = { 
     method:'GET',
      headers:{
          accept:'application/json',
          Authorization: `Bearer ${API_KEY}`
      }
    }
const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedSearchTerm ,setDebouncedSearchTerm] = useState('');
  const [trendingMovies ,setTrendingMovies] = useState([]);
  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500, [searchTerm]);
  const fetchMovies = async (qeury ='')=>{
     try {
        setLoading(true);
        setError('');
        const endpoint = qeury 
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(qeury)}`
       :  `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
        const response = await fetch(endpoint, API_OPTIONS);
        if (!response.ok) {
          throw new Error('Failed to fetch movies');

        }
        const data = await response.json();
        if (data.response == 'False') {
          setError(data.Error || 'No results found'); 
          setMovies([]);
          return;
        }
        setMovies(data.results || []);
        if(qeury &&data.results.length > 0){
          await updateSearchCount(qeury,data.results[0])
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
        setError('Failed to fetch movies. Please try again later.');
      } finally {
        setLoading(false);
      }
  }
  const loadTrendingMovies = async () =>{
    try {
       const movies = await getTrendingMovies();
       setTrendingMovies(movies)

    } catch (error) {
      console.error(`Error fetching trending movies :${error}`);

      
    }
  }


  useEffect(() => {
      fetchMovies(debouncedSearchTerm);
  },[debouncedSearchTerm]);
  useEffect(()=>{
     loadTrendingMovies();
  },[])
  return (
    <main>
      <div className="pattern">
        <div className="wrapper">
         <header>
           <img src="../public/hero.png" alt="Hero Banner" />
           <h1>Find <span className='text-gradient'>Movies</span>  you'll Enjoy Without the Hassle</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
         </header>
           {trendingMovies.length > 0 && (
            <section className='trending'>
                <h2>Trending Movies</h2>
                <ul>
                  {
                    trendingMovies.map((movie,index)=>
                    (
                      <li key={movie.$id}>
                        <p>{index + 1}</p>
                        <img src={movie.poster_url} alt={movie.title} />
                      </li>
                    ))
                  }
                </ul>
            </section>
           )}

          <section className='all-movies'>
            <h1 >All Movies</h1>
           {loading ? (<Spinner/>) : error ? (<p className='text-white'>{error}</p>) : (
            <ul>
              {movies.map((movie)=>(
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
           )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default App
