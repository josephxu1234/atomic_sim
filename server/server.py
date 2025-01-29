# server.py

import import_ipynb
import brute_force
import mixed2
from routing_game_utils import json_to_atomic_instance


from flask import Flask, request, jsonify
from flask_cors import CORS
import json


# packages required for graph calculations
import networkx as nx
from itertools import product
from typing import List, Tuple, Dict

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

def simulate_atomic(G: nx.DiGraph, source_sink_pairs: List[Tuple[int, int]], demands: List[int], latency_functions: Dict):
    # index represents a player (ex: index 0 = player 0, etc)
    # value represents a list of paths the player can take from its source to its sink
    paths = []

    # initialize paths array
    for idx, val in enumerate(source_sink_pairs):
        s = source_sink_pairs[idx][0]
        t = source_sink_pairs[idx][1]
        simple_paths = list(nx.all_simple_paths(G, s, t))
        paths.append(simple_paths)

    # flow: index represents a player (player 0 = source_sink_pair[0], etc)
    # value represents an path index for that player
    min_total_latency = float('inf')
    best_flow = None # best flow is the one that minimizes total latency

    # map a flow tuple to a map detailing the latency each player suffers in the flow
    # key: flow tuple, value: map of player : player_latency
    equil_lookup = {}

    # list of all flow tuples (need tuples for map lookup)
    # TODO: calculate product(...) and store in all_flows directly, rather than building all_flows one by one
    all_flows = []
    
    for flow in product(*[[i for i in range(len(path))] for idx, path in enumerate(paths)]):
        total_latency = 0
        flow_tuple = tuple(flow)
        all_flows.append(flow_tuple)
        f_e = {} # store the amount of traffic that uses any given edge in this flow

        # calculate how much flow each edge has, store in f_e
        for player, path_idx in enumerate(flow):
            path = paths[player][path_idx]
            print('player {}: path {}'.format(player, paths[player][path_idx]))
            for i in range(len(path) - 1):
                edge = (path[i], path[i + 1])
                if edge in f_e:
                    f_e[edge] += demands[player]
                else:
                    f_e[edge] = demands[player]

        # calculate the sum of each player's latency in this flow
        for player, path_idx in enumerate(flow):
            path = paths[player][path_idx]
            player_latency = 0
            # print('player {}: path {}'.format(player, paths[player][path_idx]))
            for i in range(len(path) - 1):
                edge = (path[i], path[i + 1])
                edge_latency = latency_functions[edge](f_e[edge])
                total_latency += edge_latency
                player_latency += edge_latency
            if flow_tuple not in equil_lookup:
                equil_lookup[flow_tuple] = {player : player_latency}
            else:
                equil_lookup[flow_tuple][player] = player_latency
                
        # update optimal flow if it exists
        if total_latency <= min_total_latency:
            min_total_latency = total_latency
            best_flow = flow
    
    # store list of equil flows, each of which is represented by a tuple
    equil_flows = []
    
    # iterate through each flow, check if each one is an equilibrium flow
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
        if is_equil:
            equil_flows.append(flow)

    return paths, equil_flows, best_flow, min_total_latency


@app.route('/calculateFlows', methods=['POST'])
def calculate_flows():
    graph_data = request.get_json()
    try:
        print(graph_data)
        G, source_sink_pairs, latency_functions = json_to_atomic_instance(graph_data)
        print('converted from json to atomic')
        paths, equil_flows, best_flow, min_total_latency = brute_force.brute_force(G, source_sink_pairs, latency_functions)
        return jsonify({
            'paths': paths,
            'equilFlows': equil_flows,
            'bestFlow': best_flow,
            'minTotalLatency': min_total_latency
        })
    except Exception as e:
        print('Error calculating equilibrium and optimal flows:', e)
        return jsonify({'message': 'Error calculating equilibrium and optimal flows.'}), 500
    

@app.route('/calculateFlowsMixed', methods=['POST'])
def calculate_flows_mixed():
    graph_data = request.get_json()
    try:
        print(graph_data)
        G, source_sink_pairs, latency_functions = json_to_atomic_instance(graph_data)
        print('converted from json to atomic')
        
        marginal_cost_pricing = False
        paths, probabilties_profile = mixed2.mixed(G, source_sink_pairs, latency_functions, 20000, .02, marginal_cost_pricing)
        flow = mixed2.argmax_flow(probabilties_profile)
        f_e, player_latencies, total_latency = mixed2.calculate_edge_flows(paths, flow, latency_functions)

        return jsonify({
            'paths': paths,
            'probabilitiesProfile': probabilties_profile,
            'argmaxFlow': flow,
            'totalLatency': total_latency
        })
    except Exception as e:
        print('Error calculating equilibrium and optimal flows:', e)
        return jsonify({'message': 'Error calculating equilibrium and optimal flows.'}), 500

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

