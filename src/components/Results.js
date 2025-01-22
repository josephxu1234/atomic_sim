import React from "react";

const Results = ({ bestFlow, equilFlows, minTotalLatency, paths }) => {
  if (minTotalLatency < 0) {
    return <p> Currently, no calculations have been performed</p>;
  } else {
    const bestFlowDisplay = bestFlow.map((path_idx, player) => (
      <p>
        Player {player}: Path {paths[player][path_idx].join(" --> ")}
      </p>
    ));

    console.log(equilFlows);

    const equilFlowsDisplay = equilFlows.map((flow, flow_idx) => (
      <div>
        <h4>Equilibrium Flow {flow_idx}</h4>
        <div>
          {flow.map((path_idx, player) => (
            <p>
              Player {player}: Path {paths[player][path_idx].join(" --> ")}
            </p>
          ))}
        </div>
      </div>
    ));

    console.log(bestFlow);
    console.log("bestFlowDisplay");
    console.log(bestFlowDisplay);
 
    return (
      <div style={{ marginTop: "10px" }}>
        <h3>Minimum Total Latency</h3>
        <p>{minTotalLatency}</p>
        <h3> Optimal Flow</h3>
        {bestFlowDisplay}
        <h3> Equilibrium Flows</h3>
        {equilFlowsDisplay}
      </div>
    );
  }
};

export default Results;
