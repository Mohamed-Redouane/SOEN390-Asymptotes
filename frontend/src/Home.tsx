import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="w-full max-w-md bg-white text-gray-800 rounded-lg shadow-md p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Welcome to Concordia's Navigation App
      </h1>
      <Link to="/login">
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-5 rounded-lg w-full transition">
          Get Started
        </button>
      </Link>
    </div>
  );
}

export default Home;