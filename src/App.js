import React, { useState } from 'react';
import './App.css'; // Ensure you have a corresponding CSS file for styling

function App() {
  const [query, setQuery] = useState('');
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);

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
      setResponse(data);
      setError('');
    } catch (err) {
      setError('An error occurred while processing your request.');
      setResponse(null);
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
    <div className="app-container">
      <div className="input-container">
        <h2>Input</h2>
        <form>
          <div className="form-group">
            <label htmlFor="query">Student Query:</label>
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your query..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="file">Upload ZIP File:</label>
            <input
              type="file"
              id="file"
              accept=".zip"
              onChange={handleFileChange}
            />
            {error && <p className="error">{error}</p>}
          </div>
          <button type="button" onClick={handleRun} disabled={!query || !file}>
            Run
          </button>
        </form>
      </div>

      <div className="response-container">
        <h2>Response</h2>
        {response ? (
          <div className="response-content">
            <pre>{JSON.stringify(response, null, 2)}</pre>
            <button type="button" onClick={handleCopy}>
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        ) : (
          <p>No response yet. Submit a query and file to see the result.</p>
        )}
      </div>
    </div>
  );
}

export default App;
