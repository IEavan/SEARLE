""" This module provides functionality for additional processing pipelines
that satify the AI requirements laid out by the requirements document.
This includes processing pipelines for predicting the users next intent
and providing additional context to specific requests"""

# Imports
import os
import json
import pickle
from itertools import product

from frame_reader import Stock_Reader
import time

# Likelihood analysis
import numpy as np
from scipy.stats import norm

# Sentiment Analysis
import warnings

with warnings.catch_warnings():
    warnings.filterwarnings("ignore", category=UserWarning)
    import nltk
    from nltk.sentiment.vader import SentimentIntensityAnalyzer

# Constants
MARKOV_TUPLE_SIZE = 2 # Delete /data/log/graph if changed
EPSILON = 1e-6

class User_Log_Writer():
    def __init__(self, log_dir="./data/log/", hooks=[]):
        """ Records path to user data files and allows for
        hooks to be registered and attached to the
        append_request functions """

        self.log_dir = log_dir
        self.log_file = os.path.join(self.log_dir, "user_log.json")
        self.hooks = hooks

    def append_request(self, request):
        """ Adds a request to the user log and calls
        all hooks registered """

        # Update Log
        with open(self.log_file, 'r+') as log:
            log_dict = json.load(log)
            log_dict["requests"].append(request)
            log.seek(0, 0)
            json.dump(log_dict, log, indent=4)

        # Call Hooks
        for hook in self.hooks:
            hook(self.log_file)

class User_Log_Reader():
    def __init__(self, log_dir="./data/log/"):
        """ Records path to user log files for later use """
        self.log_dir = log_dir
        self.log_file = os.path.join(self.log_dir, "user_log.json")

        with open(self.log_file, 'r') as log:
            log_dict = json.load(log)
        self.requests = log_dict["requests"]

    def __getitem__(self, index):
        """ Extract the request corresponding to the given index
        from the user log file.
        index can be an integer or a slice """

        return self.requests[index]

    def __len__(self):
        """ Returns the number of items in the log """
        return len(self.requests)

class Intent_Predictor():
    def __init__(self, data_path="./data/log"):
        """ Load the graph structure from the data path """
        self.data_path = data_path
        self.data_file    = os.path.join(data_path, "graph")
        self.intents_file = os.path.join(data_path, "intent_list.txt")
        self.graph_is_loaded = False

    def load_graph(self):
        """ load the graph """
        if os.path.isfile(self.data_file):
            with open(self.data_file, 'rb') as data:
                self.graph = pickle.load(data)
        else:
            self.graph = {}
            with open(self.intents_file, 'r') as intents:
                lines = intents.readlines()
                for i in range(len(lines)):
                    lines[i] = lines[i].strip()
                for node in product(lines, repeat=MARKOV_TUPLE_SIZE):
                    self.graph[str(node)] = []

        self.graph_is_loaded = True

    def update_graph(self, user_log_path):
        """ Takes in the user log path and reads the latest
        request, and adds that to the graph """

        if not self.graph_is_loaded:
            self.load_graph()

        requests = User_Log_Reader()

        # Make sure there are enough entries to form a node of the graph
        if len(requests) < MARKOV_TUPLE_SIZE:
            return
        else:
            start_node = tuple(map(self.get_intent, requests[-MARKOV_TUPLE_SIZE-2:-2]))
            end_node   = tuple(map(self.get_intent, requests[-MARKOV_TUPLE_SIZE:]))

            outgoing_edges = self.graph[str(start_node)]
            found = False
            for i in range(len(outgoing_edges)):
                if str(end_node) == outgoing_edges[i][0]:
                    found = True
                    outgoing_edges[i] = str(end_node), outgoing_edges[i][1] + 1
            if not found:
                self.graph[str(start_node)].append( (str(end_node), 1) )
       
        # Save new graph
        with open(self.data_file, 'wb') as data:
            pickle.dump(self.graph, data, protocol=pickle.HIGHEST_PROTOCOL)

    def predict_intent(self, user_log_path=None):
        """ Reads the last few intents and uses the graph to
        determine the next most likely intent """

        if not self.graph_is_loaded:
            self.load_graph()

        if user_log_path is None:
            user_log_path = os.path.join(self.data_path, "user_log.json")

        requests = User_Log_Reader()

        if len(requests) < MARKOV_TUPLE_SIZE:
            return "get_current_price" # Default intent

        start_node = str(tuple(map(self.get_intent, requests[-MARKOV_TUPLE_SIZE:])))
        outgoing_edges = self.graph[start_node]

        if len(outgoing_edges) == 0:
            return "get_current_price" # Default intent
        else:
            heighest_weight = 0
            predicted_intent = None
            for edge in outgoing_edges:
                if edge[1] > heighest_weight:
                    heighest_weight = edge[1]
                    predicted_intent = edge[0]
            return predicted_intent[- predicted_intent[::-1][2:].find("'") - 2:-2] #TODO NOT THIS
            
    def get_intent(self, request):
        """ Translates a request into an intent as listed in intents_list """
        base = request["request_type"]

        # Check if an attribute is present
        try:
            attr = request["attribute"]
            base = base.replace("attribute", attr)
        except (KeyError):
            return base

        return base

    def intent_to_request(self, intent, user_log_path=None):
        """ Takes in an intent and reconstructs the corresponding
        request associated with it """

        logs = User_Log_Reader()
        last_request = logs[-1]
        new_request = last_request

        attributes = ["price", "high", "low", "volume", "market_cap",
                      "last_close", "abs_change", "per_change"]
        contains_attribute = None
        for attr in attributes:
            if attr in intent:
                contains_attribute = attr

        if contains_attribute is not None:
            request_type = intent.replace(contains_attribute, "attribute")
            new_request["request_type"] = request_type
            new_request["attribute"] = contains_attribute
        else:
            new_request["request_type"] = intent

        return new_request


# ----------- Methods for determining the likelihood of an attriubte ------------
def get_likelihood(attribute, ticker, value, exclude_current=True,
                   look_back=2419200, distribution="norm", test=False):

    if not test: reader = Stock_Reader()
    else:        reader = Stock_Reader(data_path="./data/test_frames")

    historical_attrs = reader.get_attribute_range(ticker, attribute, time.time() - look_back)

    if len(historical_attrs) - exclude_current <3:
        return -1

    if distribution == "norm":
        loc, scale = norm.fit(historical_attrs[:-exclude_current])
        prob = norm.cdf(value, loc=loc, scale=(scale + EPSILON))
        if prob > 0.5:
            prob = 1 - prob
        prob *= 2
    elif distribution == "lognorm":
        log_val = np.log(value + EPSILON)
        log_hist = np.log(historical_attrs[:-exclude_current])
        loc, scale = norm.fit(log_hist)
        prob = norm.cdf(log_val, loc=loc, scale=scale)
        if prob > 0.5:
            prob = 1 - prob
        prob *= 2

    return prob

# ---------- Functionality for determining the sentiment of text --------------
class Sentiment_Analyzer():
    def __init__(self):
        """ Update the data files for vader and init the analyzer (VADER)"""
        nltk.download("vader_lexicon", quiet=True)
        self.vader = SentimentIntensityAnalyzer()

    def analyze(self, text):
        return self.vader.polarity_scores(text)
