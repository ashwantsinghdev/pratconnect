const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className="text-9xl font-bold text-accent">404</h1>
      <h2 className="text-2xl font-semibold text-foreground mt-4">
        Page Not Found
      </h2>
      <p className="text-muted-foreground mt-2">
        The page you're looking for doesn't exist.
      </p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 px-6 py-2 bg-primary hover:bg-primary/85 text-primary-foreground rounded-lg font-medium"
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFound;
