import Dashboard from "./Dashboard";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex gap-4 p-4">
        <aside
          className="w-87.5 min-h-screen rounded-2xl shrink-0"
          style={{ background: "#4A90D9" }}
        >
          <div className="p-6 text-white">
            <h1 className="text-xl font-bold">sidebar</h1>
            <p className="text-sm opacity-70 mt-1">navigatiom goes here</p>
          </div>
        </aside>

        <main
          className="flex-1 min-h-screen rounded-2xl"
          style={{ background: "#E8A020" }}
        >
          <div className="p-6">
            <h2 className="text-xl font-bold text-white">main content</h2>
            <p className="text-sm text-white opacity-70 mt-1">
              posts goes here
            </p>
            <div className="mt-4">
              <Dashboard />
            </div>
          </div>
        </main>

        <aside className="w-100 min-h-screen rounded-2xl shrink-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-gray-700">Right panel</h2>
            <p className="text-sm text-gray-400 mt-1">
              friends online goes here{" "}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Layout;
