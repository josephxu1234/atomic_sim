// src/App.js

import React, { useState, useEffect } from "react";
import Graph from "./components/Graph";
import Controls from "./components/Controls";
import SourceSinkForm from "./components/SourceSinkForm";
import Results from "./components/Results";
import TrafficInfoDisplay from "./components/MixedResults";

function App() {
  // Initialize state with data from localStorage or default values
  const [nodes, setNodes] = useState(() => {
    const savedNodes = localStorage.getItem("nodes");
    return savedNodes ? JSON.parse(savedNodes) : [];
  });

  const [edges, setEdges] = useState(() => {
    const savedEdges = localStorage.getItem("edges");
    return savedEdges ? JSON.parse(savedEdges) : [];
  });

  const [sourceSinkPairs, setSourceSinkPairs] = useState(() => {
    const savedPairs = localStorage.getItem("sourceSinkPairs");
    return savedPairs ? JSON.parse(savedPairs) : [];
  });

  // store graph, sourceSinkPairs in localStorage

  // Save nodes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("nodes", JSON.stringify(nodes));
  }, [nodes]);

  // Save edges to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("edges", JSON.stringify(edges));
  }, [edges]);

  // Save source-sink pairs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("sourceSinkPairs", JSON.stringify(sourceSinkPairs));
  }, [sourceSinkPairs]);

  const [bestFlow, setBestFlow] = useState([]);
  const [equilFlows, setEquilFlows] = useState([]);
  const [minTotalLatency, setMinTotalLatency] = useState(-1);
  const [paths, setPaths] = useState([]);

  const [probabilitiesProfile, setProbabilitiesProfile] = useState([]);
  const [argmaxFlow, setArgmaxFlow] = useState([]);
  const [totalLatency, setTotalLatency] = useState(-1);
  const [mode, setMode] = useState("Brute Force");

  const saveGraph = () => {
    // Prepare the graph data
    const graphData = {
      nodes,
      edges,
      sourceSinkPairs,
    };

    // Send data to the server
    fetch("/saveGraph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphData),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const loadGraph = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        const graphData = JSON.parse(content);

        // Validate the data structure
        if (graphData.nodes && graphData.edges && graphData.sourceSinkPairs) {
          setNodes(graphData.nodes);
          setEdges(graphData.edges);
          setSourceSinkPairs(graphData.sourceSinkPairs);

          // Save to localStorage if needed
          localStorage.setItem("nodes", JSON.stringify(graphData.nodes));
          localStorage.setItem("edges", JSON.stringify(graphData.edges));
          localStorage.setItem(
            "sourceSinkPairs",
            JSON.stringify(graphData.sourceSinkPairs)
          );

          alert("Graph loaded successfully.");
        } else {
          alert("Invalid graph data. Please select a valid graph.txt file.");
        }
      } catch (error) {
        console.error("Error parsing graph data:", error);
        alert("Failed to load graph. Please ensure the file is valid.");
      }
    };
    reader.readAsText(file);
  };

  // TODO: finish the calculateFlows function
  const calculateFlows = () => {
    const graphData = {
      nodes,
      edges,
      sourceSinkPairs,
    };

    fetch("calculateFlows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setBestFlow(data["bestFlow"]);
        setEquilFlows(data["equilFlows"]);
        setMinTotalLatency(data["minTotalLatency"]);
        setPaths(data["paths"]);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const calculateFlowsMixed = () => {
    const graphData = {
      nodes,
      edges,
      sourceSinkPairs,
    };

    fetch("calculateFlowsMixed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(graphData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setTotalLatency(data["totalLatency"]);
        setArgmaxFlow(data["argmaxFlow"]);
        setProbabilitiesProfile(data["probabilitiesProfile"]);
        setPaths(data["paths"]);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const clearGraph = () => {
    if (window.confirm("Are you sure you want to clear the graph?")) {
      // erase the graph
      setNodes([]);
      setEdges([]);
      setSourceSinkPairs([]);

      // erase data related to flow calculations
      setBestFlow([]);
      setEquilFlows([]);
      setMinTotalLatency(-1);
      setPaths([]);

      localStorage.removeItem("nodes");
      localStorage.removeItem("edges");
      localStorage.removeItem("sourceSinkPairs");
    }
  };

  return (
    <div className="App">
      <h1>Atomic Congestion Game Simulator</h1>
      <Graph
        nodes={nodes}
        edges={edges}
        setNodes={setNodes}
        setEdges={setEdges}
      />
      <Controls
        saveGraph={saveGraph}
        loadGraph={loadGraph}
        clearGraph={clearGraph}
        setMode={setMode}
        calculateFlows={{'Brute Force': calculateFlows, 'Mixed': calculateFlowsMixed}}
      />
      <SourceSinkForm
        nodes={nodes}
        sourceSinkPairs={sourceSinkPairs}
        setSourceSinkPairs={setSourceSinkPairs}
      />

      {mode === "Brute Force" && (
        <Results
          bestFlow={bestFlow}
          equilFlows={equilFlows}
          minTotalLatency={minTotalLatency}
          paths={paths}
        />
      )}

      {mode === "Mixed" && (
        <TrafficInfoDisplay
          totalLatency={totalLatency}
          paths={paths}
          probabilitiesProfile={probabilitiesProfile}
          flow={argmaxFlow}
        />
      )}
    </div>
  );
}

export default App;
