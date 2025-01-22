import React from 'react';

const SourceSinkForm = ({ nodes, sourceSinkPairs, setSourceSinkPairs }) => {
  const addPair = () => {
    setSourceSinkPairs([...sourceSinkPairs, { source: '', sink: '', demand: 1 }]);
  };

  const removePair = (index) => {
    const newPairs = sourceSinkPairs.filter((_, i) => i !== index);
    setSourceSinkPairs(newPairs);
  };

  const handleChange = (index, field, value) => {
    const newPairs = sourceSinkPairs.map((pair, i) =>
      i === index ? { ...pair, [field]: value } : pair
    );
    setSourceSinkPairs(newPairs);
  };

  return (
    <div id="sourceSinkForm" style={{ marginTop: '20px' }}>
      <h3>Source-Sink Pairs</h3>
      {sourceSinkPairs.map((pair, index) => (
        <div key={index} className="pairEntry" style={{ marginBottom: '10px' }}>
          <label>
            Source:
            <select
              value={pair.source}
              onChange={(e) => handleChange(index, 'source', e.target.value)}
            >
              <option value="">--Select Node--</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label || node.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sink:
            <select
              value={pair.sink}
              onChange={(e) => handleChange(index, 'sink', e.target.value)}
            >
              <option value="">--Select Node--</option>
              {nodes.map((node) => (
                <option key={node.id} value={node.id}>
                  {node.label || node.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            Demand:
            <input
              type="number"
              min="1"
              value={pair.demand}
              onChange={(e) => handleChange(index, 'demand', e.target.value)}
              style={{ width: '60px' }}
            />
          </label>
          <button type="button" onClick={() => removePair(index)}>
            Remove
          </button>
        </div>
      ))}
      <button id="addPairBtn" type="button" onClick={addPair}>
        Add Source-Sink Pair
      </button>
    </div>
  );
};

export default SourceSinkForm;