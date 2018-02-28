""" This module provides functionality for additional processing pipelines
that satify the AI requirements laid out by the requirements document.
This includes processing pipelines for predicting the users next intent
and providing additional context to specific requests"""

# Imports
import os
import json
import pickle
from itertools import product

# Constants
MARKOV_TUPLE_SIZE = 2

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

    def __getitem__(self, index):
        """ Extract the request corresponding to the given index
        from the user log file.
        index can be an integer or a slice """

        with open(self.log_file, 'r') as log:
            log_dict = json.load(log)
            requests = log_dict["requests"]

        return requests[index]

class Intent_Predictor():
    def __init__(self, data_path="./data/log"):
        """ Load the graph structure from the data path """
        self.data_file    = os.path.join(data_path, "graph.txt")
        self.intents_file = os.path.join(data_file, "intent_list.txt")

        if os.path.isfile(self.data_file):
            self.graph = pickle.load(self.data_file)
        else:
            self.graph = {}
            with open(self.intents_file, 'r') as intents:
                lines = intents.readlines()
                for i in range(MARKOV_TUPLE_SIZE - 1):
