import { useState } from "react";

function Landing() {
  const [url, setUrl] = useState("");

  const handleConnect = () => {
    localStorage.setItem("shop", url);
    const uri = "http://localhost:3000/api/install?shop=" + url;
    window.open(uri, "_self");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="my-store-name.myshopify.com"
          className="border p-3 mb-4 w-full rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button
          onClick={handleConnect}
          className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition duration-200 ease-in-out"
        >
          Connect Now
        </button>
      </div>
    </div>
  );
}

export default Landing;
