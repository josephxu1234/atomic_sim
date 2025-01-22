// src/components/Controls.js

import React from 'react';

const Controls = ({ saveGraph, loadGraph, clearGraph, calculateFlows}) => {
  const fileInputRef = React.useRef();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      loadGraph(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div id="controls" style={{ marginTop: '10px' }}>
      <button onClick={saveGraph}>Save Graph</button>
      <button onClick={triggerFileSelect}>Load Graph</button>
      <button onClick={calculateFlows}> Calculate Flows </button>
      <button onClick={clearGraph}>Clear Graph</button>
      <input
        type="file"
        accept=".txt"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default Controls;

