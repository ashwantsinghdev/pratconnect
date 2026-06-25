const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-9xl font-bold text-blue-400">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mt-4">
        Page Not Found
      </h2>
      <p className="text-gray-400 mt-2">
        The page you're looking for doesn't exist.
      </p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 px-6 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded font-medium"
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFound;
