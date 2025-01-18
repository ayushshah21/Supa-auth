const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Zendesk Clone
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Streamlined ticket management and support, simplified.
        </p>
        <div className="mt-6 space-x-4">
          <a
            href="/login"
            className="inline-block px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Login
          </a>
          <a
            href="/register"
            className="inline-block px-6 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
