# server.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

# packages required for graph calculations
import networkx as nx
from itertools import product
from typing import List, Tuple, Dict

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

def simulate_atomic(G: nx.DiGraph, source_sink_pairs: List, latency_functions: Dict):
    num_players = len(source_sink_pairs) # k players, one for each source-sink pair
    paths = []
    
    for idx, val in enumerate(source_sink_pairs):
        s = source_sink_pairs[idx][0]
        t = source_sink_pairs[idx][1]
        simple_paths = list(nx.all_simple_paths(G, s, t))
        paths.append(simple_paths)

    # flow: index represents a player (player 0 = source_sink_pair[0], etc)
    # value represents an path index for that player
    min_total_latency = float('inf')
    best_flow = None # best flow is the one that minimizes total latency

    equil_lookup = {}
    all_flows = []
    
    for flow in product(*[[i for i in range(len(path))] for idx, path in enumerate(paths)]):
        total_latency = 0
        flow_tuple = tuple(flow)
        all_flows.append(flow_tuple)
        f_e = {} # store the amount of traffic that uses any given edge in this flow

        # calculate how much flow each edge has, store in f_e
        for player, path_idx in enumerate(flow):
            path = paths[player][path_idx]
            for i in range(len(path) - 1):
                edge = (path[i], path[i + 1])
                if edge in f_e:
                    f_e[edge] += 1.0
                else:
                    f_e[edge] = 1.0

        # calculate the sum of each player's latency in this flow
        for player, path_idx in enumerate(flow):
            path = paths[player][path_idx]
            player_latency = 0
            for i in range(len(path) - 1):
                edge = (path[i], path[i + 1])
                edge_latency = latency_functions[edge](f_e[edge])
                total_latency += edge_latency
                player_latency += edge_latency
            if flow_tuple not in equil_lookup:
                equil_lookup[flow_tuple] = {player : player_latency}
            else:
                equil_lookup[flow_tuple][player] = player_latency
                
        if total_latency <= min_total_latency:
            min_total_latency = total_latency
            best_flow = flow

    for flow in all_flows:
        is_equil = True
        for player in range(len(flow)):
            curr_latency = equil_lookup[flow][player]
            for path_idx in range(len(paths[player])):
                flow_list = list(flow)
                flow_list[player] = path_idx
                new_flow = tuple(flow_list)
                if new_flow in equil_lookup:
                    # could've done better by deviating
                    if equil_lookup[new_flow][player] < curr_latency: 
                        is_equil = False
                        break

    return min_total_latency, best_flow

def json_to_graph(graph_file):
    with open(graph_file) as f:
        graph = json.load(f)
    id_to_label = {}
    for node in graph['nodes']:
        print(node)
        id_to_label[node['id']] = node['label']
    G = nx.DiGraph()
    latency_functions = {}
    for edge in graph['edges']:
        from_node = id_to_label[edge['from']]
        to_node = id_to_label[edge['to']]
        G.add_edge(from_node, to_node)
        latency_functions[(from_node, to_node)] = eval('lambda x: ' + edge['latencyFunction'])
    nx.draw_networkx(G)
    print(latency_functions)
    return (G, latency_functions)

# Endpoint to save the graph data
@app.route('/saveGraph', methods=['POST'])
def save_graph():
    graph_data = request.get_json()

    try:
        # Save the graph data to a text file
        with open('graph.txt', 'w') as f:
            json.dump(graph_data, f, indent=2)

        print('Graph data saved successfully.')

        # Log the source-sink pairs
        if 'sourceSinkPairs' in graph_data:
            print('Source-Sink Pairs:', graph_data['sourceSinkPairs'])

        return jsonify({'message': 'Graph data saved successfully.'})
    except Exception as e:
        print('Error saving graph:', e)
        return jsonify({'message': 'Error saving graph data.'}), 500

if __name__ == '__main__':
    port = 6000  # Adjust the port if necessary
    app.run(host='0.0.0.0', port=port)

