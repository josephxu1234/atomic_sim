import React from "react";

const TrafficInfoDisplay = ({ totalLatency, paths, probabilitiesProfile, flow }) => {
  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
      {/* Total Latency */}
      <h1 className="text-2xl font-bold mb-4">Traffic Info</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Total Latency:</h2>
        <p className="text-lg">{totalLatency}</p>
      </div>

      {/* Paths */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Paths:</h2>
        <ul className="list-disc pl-6">
          {paths.map((playerPaths, playerIndex) => (
            <li key={playerIndex} className="mb-2">
              <span className="font-semibold">Player {playerIndex + 1}:</span>
              <ul className="list-circle pl-4">
                {playerPaths.map((path, pathIndex) => (
                  <li key={pathIndex}>{path.join(" → ")}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Probabilities Profile */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Probabilities Profile:</h2>
        <ul className="list-decimal pl-6">
          {probabilitiesProfile.map((probabilities, playerIndex) => (
            <li key={playerIndex} className="mb-2">
              <span className="font-semibold">Player {playerIndex + 1}:</span>
              <ul className="list-circle pl-4">
                {probabilities.map((probability, index) => (
                  <li key={index}>
                    Path {index + 1}: {probability.toFixed(4)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Flow */}
      <div>
        <h2 className="text-xl font-semibold">Flow:</h2>
        <ul className="list-decimal pl-6">
          {flow.map((chosenPath, playerIndex) => (
            <li key={playerIndex}>
              Player {playerIndex + 1}: Path {chosenPath + 1} (
              {paths[playerIndex][chosenPath].join(" → ")})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TrafficInfoDisplay;
