// src/components/Graph.js

import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';

const Graph = ({ nodes, edges, setNodes, setEdges }) => {
  const networkRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const data = {
      nodes,
      edges,
    };

    const options = {
      manipulation: {
        enabled: true,
        addNode: (data, callback) => {
          const label = window.prompt('Enter node label:', 'node');
          if (label !== null) {
            data.label = label;
            callback(data);
            setNodes((prevNodes) => [...prevNodes, data]);
          }
        },
        addEdge: (data, callback) => {
          if (data.from === data.to) {
            if (!window.confirm('Do you want to connect the node to itself?')) {
              callback(null);
              return;
            }
          }
          const latency = window.prompt('Enter latency function for this edge (e.g., x, x^2, 2x+1):', 'x');
          if (latency !== null) {
            data.label = latency;
            data.latencyFunction = latency;
            data.arrows = 'to';
            callback(data);
            setEdges((prevEdges) => [...prevEdges, data]);
          } else {
            callback(null);
          }
        },
        editEdge: (data, callback) => {
          const latency = window.prompt('Edit latency function:', data.latencyFunction || 'x');
          if (latency !== null) {
            data.label = latency;
            data.latencyFunction = latency;
            callback(data);
            setEdges((prevEdges) => prevEdges.map((edge) => (edge.id === data.id ? data : edge)));
          } else {
            callback(null);
          }
        },
        deleteNode: function (data, callback) {
          if (
            window.confirm('Are you sure you want to delete the selected node(s)?')
          ) {
            callback(data);
            // Update nodes state
            setNodes((prevNodes) =>
              prevNodes.filter((node) => !data.nodes.includes(node.id))
            );
            // Update edges state
            setEdges((prevEdges) =>
              prevEdges.filter((edge) => !data.edges.includes(edge.id))
            );
          } else {
            callback(null);
          }
        },
        deleteEdge: function (data, callback) {
          if (
            window.confirm('Are you sure you want to delete the selected edge(s)?')
          ) {
            callback(data);
            // Update edges state
            setEdges((prevEdges) =>
              prevEdges.filter((edge) => !data.edges.includes(edge.id))
            );
          } else {
            callback(null);
          }
        },
      },
      edges: {
        arrows: {
          to: { enabled: true, scaleFactor: 1, type: 'arrow' },
        },
        smooth: { enabled: true, type: 'dynamic' },
      },
    };

    if (!networkRef.current) {
      // Initialize the network
      networkRef.current = new Network(containerRef.current, data, options);

    } else {
      // Update the data
      networkRef.current.setData(data);
    }


  }, [nodes, edges, setNodes, setEdges]);

  return <div ref={containerRef} style={{ height: '600px', border: '1px solid lightgray' }} />;
};

export default Graph;

