import { useState } from "react";

function App() {

  const [guidelines, setGuidelines] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCheck() {

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("http://localhost:3000/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          guidelines: guidelines,
          content: content
        })
      });

      const data = await response.json();

      setResult(data.message);
      console.log(data);

    } catch (error) {
      setResult("Something went wrong!");
      console.log(error);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl font-bold text-indigo-700 text-center">
          Inkloom AI
        </h1>

        <p className="text-center text-gray-600 mt-2">
          Intelligent Brand Governance Platform
        </p>

        <div className="bg-white p-8 rounded-xl shadow-md mt-10">

          <h2 className="text-xl font-semibold mb-3">
            Brand Guidelines
          </h2>

          <textarea
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            placeholder="Enter your brand guidelines..."
            rows="4"
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <h2 className="text-xl font-semibold mt-6 mb-3">
            Content to Check
          </h2>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your content here..."
            rows="6"
            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={handleCheck}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg mt-6 w-full"
          >
            {loading ? "Sending..." : "Check Content"}
          </button>

          {result && (
            <p className="mt-5 text-green-700 font-medium">
              {result}
            </p>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;