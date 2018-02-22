""" Script to test how to interface data between Node and Python
script based on https://www.sohamkamani.com/blog/2015/08/21/python-nodejs-comm/

Script expects to recieve a json through stdin to determine which actions to take
and communicates back on stdout"""

# Imports
import json
import sys

import frame_reader

if __name__ == "__main__":
    # Load json arguments passed in from node
    input_args = json.loads(sys.stdin.readline())

    response = {}
    response["result"] = {}
    response["request"] = input_args
    response["error"] = {}

    # Init the data frame reader for easy data access
    reader = frame_reader.Stock_Reader()
    request_type_understood = False

    # Handle each type of request specified in the json
    if input_args["request_type"] == "get_current_attribute":
        request_type_understood = True
        result = reader.get_current_attribute(
                input_args["ticker"],
                input_args["attribute"])
       
        if result != -1:
            response["result"]["value"] = result
        else:
            response["error"]["message"] = "Stock with ticker '" + \
                    input_args["ticker"] + "' was not found"
            response["error"]["type"] = "ValueError"

    if input_args["request_type"] == "get_attribute":
        request_type_understood = True
        frame_name = reader.get_closest_frame(input_args["start_time"])
        result = reader.get_attribute(
                input_args["ticker"],
                input_args["attribute"],
                frame_name)
        
        if result != -1:
            response["result"]["value"] = result
        else:
            response["error"]["message"] = "Stock with ticker '" + \
                    input_args["ticker"] + "' was not found"
            response["error"]["type"] = "ValueError"

    if not request_type_understood:
        response["error"]["message"] = "Request type '" + \
                input_args["request_type"] + "' was not recognised"
        response["error"]["type"] = "ValueError"

    print(json.dumps(response))
