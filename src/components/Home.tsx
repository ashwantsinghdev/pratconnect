import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="animate__animated animate__fadeIn min-h-screen bg-linear-to-b from-indigo-900 via-purple-900 to-blue-900 text-white font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 md:py-32">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-pink-400">
          Welcome to PractConnect
        </h1>
        <p className="text-lg md:text-xl max-w-2xl text-gray-200 mb-8">
          Connect, chat, and share moments with your best friends — wherever
          they are.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/login">
            <button className="bg-pink-500 hover:bg-pink-600 px-6 py-3 rounded-lg text-white font-semibold">
              Login
            </button>
          </Link>
          <Link to="/signup">
            <button className="bg-white text-pink-600 hover:bg-pink-100 px-6 py-3 rounded-lg font-semibold">
              Sign Up
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-indigo-800 bg-opacity-30">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-pink-300">
          Features You'll Love
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="bg-white bg-opacity-10 p-6 rounded-2xl shadow-lg hover:scale-105 transition">
            <h3 className="text-xl font-bold text-pink-400 mb-2">
              Real-time Chat
            </h3>
            <p className="text-gray-600">
              Stay connected with instant messaging and emoji support.
            </p>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-2xl shadow-lg hover:scale-105 transition">
            <h3 className="text-xl font-bold text-pink-400 mb-2">
              Video Calls
            </h3>
            <p className="text-gray-600">
              Talk face-to-face with HD-quality video calls.
            </p>
          </div>
          <div className="bg-white bg-opacity-10 p-6 rounded-2xl shadow-lg hover:scale-105 transition">
            <h3 className="text-xl font-bold text-pink-400 mb-2">
              Audio Calls
            </h3>
            <p className="text-gray-600">
              Enjoy crystal-clear voice chats anywhere, anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="px-6 py-20 bg-purple-800 bg-opacity-30">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-pink-300">
          Why Social Networking?
        </h2>
        <ul className="max-w-3xl mx-auto space-y-6 text-lg text-gray-100 list-disc list-inside">
          <li>Stay connected with friends and family across the globe</li>
          <li>Build communities around your interests</li>
          <li>Improve communication skills and confidence</li>
          <li>Stay updated with real-time events and news</li>
          <li>Collaborate and share memories seamlessly</li>
        </ul>
      </section>
    </div>
  );
};

export default Home;
