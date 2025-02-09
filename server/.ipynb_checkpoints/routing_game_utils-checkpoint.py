import networkx as nx
from itertools import product
from typing import List, Tuple, Dict
import json
import random

import sympy as sp
import numpy as np

# given a list of values, return the softmax vector
def softmax(values):
    exp_values = np.exp(values - np.max(values))  # Shift for numerical stability
    return exp_values / np.sum(exp_values)

def sample_move(probabilities):
    # sample a move based on a probablity distribution
    return np.random.choice(len(probabilities), p=probabilities)

def sample_move_skip_index(probabilities, skip_index):
    """
    Sample a move based on a probability distribution, skipping the specified index.

    Parameters:
    - probabilities: List or numpy array of probabilities for each index.
    - skip_index: Index to skip during sampling.

    Returns:
    - Selected index, excluding the skipped index.
    """
    probabilities = np.array(probabilities)  # Ensure input is a numpy array
    adjusted_probs = np.delete(probabilities, skip_index)  # Remove skipped index
    adjusted_probs /= adjusted_probs.sum()  # Normalize probabilities

    # Sample from the adjusted probabilities
    sampled_index = np.random.choice(len(adjusted_probs), p=adjusted_probs)
    
    # Map back to the original index
    return sampled_index if sampled_index < skip_index else sampled_index + 1

# logits: list of logits for the player's strategies
# feedback: feedback for the chosen move
# chosen_idx: index of the chosen move
# learning rate: step size for updating the logit
def update_logits(logits, feedback, chosen_idx, learning_rate=1):
    logits[chosen_idx] += learning_rate * feedback
    return logits

def json_to_atomic_instance(graph_json, verbose=False):
    if isinstance(graph_json, str):
        with open(graph_json) as f:
            graph = json.load(f)
    elif not isinstance(graph_json, dict):
        raise Exception('Invalid graph json type. Either requires string of a filename or a json object')
    id_to_label = {}
    for node in graph['nodes']:
        if verbose:
            print(node)
        id_to_label[node['id']] = node['label']
    G = nx.DiGraph()
    latency_functions = {}
    for edge in graph['edges']:
        from_node = id_to_label[edge['from']]
        to_node = id_to_label[edge['to']]
        G.add_edge(from_node, to_node)

        f1 = eval('lambda x: ' + edge['latencyFunction'])
        # f2 = get_derivative_function(edge['latencyFunction'], variable='x')
        latency_functions[(from_node, to_node)] = f1
    source_sink_pairs = []
    demands = []
    for source_sink_pair in graph['sourceSinkPairs']:
        source_node = id_to_label[source_sink_pair['source']]
        sink_node = id_to_label[source_sink_pair['sink']]
        demand = int(source_sink_pair['demand'])
        source_sink_pairs.append((source_node, sink_node))
        demands.append(demand)
        
    nx.draw_networkx(G)
    if verbose:
        print(latency_functions)
    return (G, source_sink_pairs, demands, latency_functions)


# given an expr string that can be evaluated with sympy
# return the derivative as a lambda function
def get_derivative_function(expression_str, variable='x'):    
    # define variable, parse expression
    x = sp.symbols(variable)
    expression = sp.sympify(expression_str)
    
    # differentiate expression w.r.t. x
    derivative_expr = sp.diff(expression, x)

    # convert derivative to python function
    derivative_func = sp.lambdify(x, derivative_expr, 'numpy')

    # print original + derivative for verifications purposes
    print(f"Original expression: {expression}")
    print(f"Derivative: {derivative_expr}")
    
    return derivative_func

def get_strategy_sets(G, source_sink_pairs):
    # index represents a player (e.g., index 0 = player 0)
    # value represents a list of paths the player can take from their source to their sink
    paths = []

    # Initialize paths array for each player
    # idx represents the player, (s, t) represents that player's associated commodity
    for idx, (s, t) in enumerate(source_sink_pairs):
        simple_paths = list(nx.all_simple_paths(G, s, t))
        paths.append(simple_paths)

    return paths

# paths: each index represents a player, the value at that index represents that player's available strategy set (ordered)
# flow: each index represents a player, the value at that index represents the player's choice of strategy (as an index of their strategy set)
# demands: each index represents a player, the value at that index represents how many units of traffic that player is routing

# return a dictionary of edge flows, an array of player latencies, and the total latency across all players
def calculate_edge_flows(paths, flow, demands, latency_functions):
    f_e = {}  # Edge flows. key is an edge (represented as a tuple between 2 vertices), value is the flow (units of traffic on that edge)
    # go through each player and their choice of path

    player_latencies = [0 for _ in range(len(flow))]
    
    for player_idx, path_idx in enumerate(flow): # go thru each player and their chosen path
        path = paths[player_idx][path_idx] # get the path that the player is taking
        demand = demands[player_idx]
        
        for i in range(len(path) - 1): # route through that player's path
            edge = (path[i], path[i + 1])
            f_e[edge] = f_e.get(edge, 0) + demand # update the congestion for this edge

    for player_idx in range(len(player_latencies)): # go through each player
        path_idx = flow[player_idx]
        current_path = paths[player_idx][path_idx]
        current_latency = 0
        for i in range(len(current_path) - 1):
            edge = (current_path[i], current_path[i + 1])
            congestion = f_e[edge]
            edge_latency = latency_functions[edge](f_e[edge])
            current_latency += edge_latency
        player_latencies[player_idx] = current_latency
    total_latency = sum(player_latencies)
    return f_e, player_latencies, total_latency