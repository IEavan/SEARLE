""" This module provides functionality for additional processing pipelines
that satify the AI requirements laid out by the requirements document.
This includes processing pipelines for predicting the users next intent
and providing additional context to specific requests"""

# Imports
import os
import json

class User_Log_Writer():
    def __init__(self, log_path="./data/log/", hooks=[]):
        """ Records path to user data files and allows for
        hooks to be registered and attached to the
        append_request functions """

        self.log_path = log_path
        self.log_file = os.path.join(self.log_path, "user_log.json")
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
    def __init__(self, log_path="./data/log/"):
        """ Records path to user log files for later use """
        self.log_path = log_path
        self.log_file = os.path.join(self.log_path, "user_log.json")

    def __getitem__(self, index):
        """ Extract the request corresponding to the given index
        from the user log file.
        index can be an integer or a slice """

        with open(self.log_file, 'r') as log:
            log_dict = json.load(log)
            requests = log_dict["requests"]

        return requests[index]
