// src/components/Controls.js

import React from "react";
import { useState } from "react";

const Controls = ({
  saveGraph,
  loadGraph,
  clearGraph,
  setMode,
  calculateFlows,
}) => {
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

  const options = ["Brute Force", "Mixed"];

  const [controlMode, setControlMode] = useState("Brute Force");

  return (
    <div id="controls" style={{ marginTop: "10px" }}>
      <button onClick={saveGraph}>Save Graph</button>
      <button onClick={triggerFileSelect}>Load Graph</button>
      <button onClick={calculateFlows[controlMode]}> Calculate Flows </button>
      <select
        onChange={(e) => {
          setMode(e.target.value);
          setControlMode(e.target.value);
        }}
        defaultValue={"Brute Force"}
      >
        {options.map((option, idx) => (
          <option key={idx}>{option}</option>
        ))}
      </select>
      <button onClick={clearGraph}>Clear Graph</button>
      <input
        type="file"
        accept=".txt"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default Controls;
