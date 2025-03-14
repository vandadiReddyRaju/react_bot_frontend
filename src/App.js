import React, { useState } from 'react';
import './App.css'; // Ensure you have a corresponding CSS file for styling

function App() {
  const [query, setQuery] = useState('');
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.zip')) {
      setFile(selectedFile);
      setError('');
    } else {
      setFile(null);
      setError('Please upload a valid ZIP file.');
    }
  };

  const handleRun = async () => {
    if (!query || !file) {
        setError('Please provide both a query and a ZIP file.');
        return;
    }

    setError(''); // Clear error state before making the request
    setIsLoading(true); // Set loading state to true when the request starts

    const formData = new FormData();
    formData.append('query', query);
    formData.append('file', file);

    try {
        const response = await fetch('http://127.0.0.1:5000/api/process', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch response from the server.');
        }

        const data = await response.json();
        if (data.error) {
            setError(data.error); // Set error if the backend returns an error
            setResponse(null);
        } else {
            setResponse(data.response); // Set response data
        }
    } catch (err) {
        setError('An error occurred while processing your request.');
        setResponse(null);
    } finally {
        setIsLoading(false); // Reset loading state when the request is completed
    }
};
  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response, null, 2))
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
        })
        .catch(() => setError('Failed to copy response to clipboard.'));
    }
  };

  return (
    <div className="ide-mentor-bot">
      <div className="container-1">
        <h1>React Mentor Bot</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label htmlFor="query">Your Query:</label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., Test cases failed, can you help me with my mistakes?"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="file">Upload Zip File (Max 50MB):</label>
            <input
              type="file"
              id="file"
              accept=".zip"
              onChange={handleFileChange}
              required
            />
          </div>

          <button
            type="submit"
            onClick={handleRun}
            disabled={isLoading || !query || !file}
            className={isLoading ? 'loading' : ''}
          >
            {isLoading ? 'Processing...' : 'Run'}
          </button>

          {error && <div className="error">{error}</div>}
        </form>
      </div>

      <div className="container-2" style={{ position: 'relative' }}>
        <h1>Response</h1>
        {response ? (
          
            <button
              onClick={handleCopy}
              className="copy-button"
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
            <pre>{JSON.stringify(response, null, 2)}</pre>
         
        ) : (
          <p>No response yet. Submit a query and file to see the result.</p>
        )}
      </div>
    </div>
  );
}

export default App;
