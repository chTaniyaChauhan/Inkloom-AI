import { useState } from "react";

function App() {
  const [guidelines, setGuidelines] = useState("");
  const [content, setContent] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Human review states
  const [reviewDecisions, setReviewDecisions] = useState({});
  const [finalContent, setFinalContent] = useState(null);
  
  function handleReset() {
  setGuidelines("");
  setContent("");
  setResult(null);
  setReviewDecisions({});
  setFinalContent(null);
  };

  async function handleCheck() {
    if (!guidelines.trim() || !content.trim()) {
      setError("Please enter both brand guidelines and content.");
      setResult(null);
      return;
    }

    setLoading(true);
    setResult(null);
    setError("");
    setReviewDecisions({});
    setFinalContent(null);

    try {
      const response = await fetch("http://localhost:3000/api/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          guidelines,
          content
        })
      });

      const data = await response.json();
      console.log("BACKEND RESPONSE:", data);
      if (!response.ok) {
        throw new Error(data.message || "Analysis failed!");
      }

      if (!data.analysis || typeof data.analysis !== "object") {
        throw new Error("Invalid analysis response received.");
      }

      setResult(data);

    } catch (error) {
      setError(error.message || "Something went wrong!");
      console.log(error);

    } finally {
      setLoading(false);
    }
  }

  // Accept or reject an issue
  function handleReview(index, decision) {
    setReviewDecisions(prev => ({
      ...prev,
      [index]: decision
    }));

    setFinalContent(null);
  }

  // Generate final content using accepted suggestions
  function handleGenerateFinal() {
    let updatedContent = content;

    const issues = result.analysis.issues || [];

    issues.forEach((issue, index) => {
      if (reviewDecisions[index] !== "accepted") {
        return;
      }

      const originalText = issue.originalText || "";
      const suggestedText = issue.suggestedText;

      if (
        !originalText ||
        typeof suggestedText !== "string"
      ) {
        return;
      }

      // Remove repeated sentence
      if (
        suggestedText === "" &&
        issue.category?.toLowerCase() === "repetition"
      ) {
        const matchIndex = updatedContent.lastIndexOf(originalText);

        if (matchIndex !== -1) {
          let start = matchIndex;

          while (
            start > 0 &&
            /\s/.test(updatedContent[start - 1])
          ) {
            start--;
          }

          let end = matchIndex + originalText.length;

          while (
            end < updatedContent.length &&
            /\s/.test(updatedContent[end])
          ) {
            end++;
          }

          if (
            end < updatedContent.length &&
            /[.!?]/.test(updatedContent[end])
          ) {
            end++;
          }

          updatedContent =
            updatedContent.slice(0, start) +
            updatedContent.slice(end);
        }

      } else {
        // Replace problematic text
        const matchIndex = updatedContent.indexOf(originalText);

        if (matchIndex !== -1) {
          updatedContent =
            updatedContent.slice(0, matchIndex) +
            suggestedText +
            updatedContent.slice(matchIndex + originalText.length);
        }
      }
    });

    setFinalContent(updatedContent);
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

          <div className="flex items-center gap-3">
            <button
             onClick={handleCheck}
             className="px-5 py-2 rounded-lg bg-blue-600 text-white"
            >
             Check Content
            </button>

            <button
             type="button"
             onClick={handleReset}
             className="px-5 py-2 rounded-lg border gray-600"
            >
            ↻ Refresh
            </button>
          </div>

          {loading && (
            <p className="text-center text-indigo-600 mt-5">
              Please wait! Checking your content...
            </p>
          )}

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-5">

              {/* Analysis Summary */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5">
                <h2 className="text-xl font-bold text-indigo-700 mb-3">
                  Analysis Summary
                </h2>

                <p className="text-gray-800">
                  {result.analysis.summary}
                </p>

                <p className="text-sm mt-3 font-medium">
                  Analysis source:{" "}
                  {result.source === "fallback"
                    ? "Basic Rule-Based Checker"
                    : "Gemini AI"}
                </p>
              </div>

              {/* Detected Issues */}
              <div className="bg-white border rounded-lg p-5">

                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Detected Issues ({result.analysis.issues?.length || 0})
                </h2>

                {result.analysis.issues?.length > 0 ? (

                  result.analysis.issues.map((issue, index) => {

                    const hasReplacement =
                      typeof issue.suggestedText === "string";

                    return (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 mb-4"
                      >

                        <div className="flex justify-between items-center flex-wrap gap-2">

                          <h3 className="font-semibold text-indigo-700">
                            {issue.category}
                          </h3>

                          <span className="text-sm font-medium text-red-600">
                            {issue.severity} Severity
                          </span>

                        </div>

                        <p className="text-sm text-gray-500 mt-3">
                          Original Text
                        </p>

                        <p className="text-gray-800 mt-1">
                          {issue.originalText}
                        </p>

                        <p className="text-sm text-gray-500 mt-3">
                          Problem
                        </p>

                        <p className="text-gray-800 mt-1">
                          {issue.problem}
                        </p>

                        <p className="text-sm text-gray-500 mt-3">
                          Suggestion
                        </p>

                        <p className="text-green-700 mt-1">
                          {issue.suggestion}
                        </p>

                        <p className="text-sm text-gray-500 mt-3">
                          Suggested Replacement
                        </p>

                        <p className="text-gray-800 mt-1">
                          {hasReplacement
                            ? issue.suggestedText || "Remove this repeated sentence."
                            : "Replacement text is not available."}
                        </p>

                        {!hasReplacement ? (

                          <p className="text-sm text-orange-600 mt-3">
                            Please update the backend AI response to include suggestedText.
                          </p>

                        ) : (

                          <div className="flex gap-3 mt-5 flex-wrap">

                            <button
                              onClick={() => handleReview(index, "accepted")}
                              className={`px-5 py-2 rounded-lg font-medium ${
                                reviewDecisions[index] === "accepted"
                                  ? "bg-green-700 text-white"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              Accept
                            </button>

                            <button
                              onClick={() => handleReview(index, "rejected")}
                              className={`px-5 py-2 rounded-lg font-medium ${
                                reviewDecisions[index] === "rejected"
                                  ? "bg-red-700 text-white"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                            >
                              Reject
                            </button>

                          </div>

                        )}

                        {reviewDecisions[index] === "accepted" && (
                          <p className="text-sm text-green-700 font-semibold mt-3">
                            ✓ Accepted
                          </p>
                        )}

                        {reviewDecisions[index] === "rejected" && (
                          <p className="text-sm text-red-700 font-semibold mt-3">
                            ✕ Rejected
                          </p>
                        )}

                      </div>
                    );
                  })

                ) : (

                  <p className="text-green-700">
                    No issues detected!
                  </p>

                )}

              </div>

              {/* Generate Final Content */}
              {result.analysis.issues?.length > 0 && (

                <div className="text-center">

                  <button
                    onClick={handleGenerateFinal}
                    disabled={Object.keys(reviewDecisions).length === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold px-6 py-3 rounded-lg w-full"
                  >
                    Generate Final Approved Content
                  </button>

                </div>

              )}

              {/* Final Approved Content */}
              {finalContent !== null && (

                <div className="bg-green-50 border border-green-200 rounded-lg p-5">

                  <h2 className="text-xl font-bold text-green-700 mb-3">
                    Final Approved Content
                  </h2>

                  <p className="text-gray-800 whitespace-pre-wrap leading-7">
                    {finalContent}
                  </p>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(finalContent);
                    }}
                    className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg mt-5"
                  >
                    Copy Final Content
                  </button>

                </div>

              )}

              {/* Original AI Revised Content */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">

                <h2 className="text-xl font-bold text-gray-700 mb-3">
                  AI Revised Content
                </h2>

                <p className="text-gray-800 whitespace-pre-wrap leading-7">
                  {result.analysis.revisedContent}
                </p>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
