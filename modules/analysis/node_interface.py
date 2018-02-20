""" Script to test how to interface data between Node and Python
script based on https://www.sohamkamani.com/blog/2015/08/21/python-nodejs-comm/

Script expects to recieve a json through stdin to determine which actions to take
and communicates back on stdout"""

# Imports
import json
import sys

import frame_reader

if __name__ == "__main__":
    input_args = json.loads(sys.stdin.readline())
    reader = frame_reader.Stock_Reader()

    if input_args["request_type"] == "get_current_attribute":
        result = reader.get_current_attribute(
                input_args["ticker"],
                input_args["attribute"])
        print(result)

    if input_args["request_type"] == "get_attribute":
        frame_name = reader.get_closest_frame(input_args["start_time"])
        result = reader.get_attribute(
                input_args["ticker"],
                input_args["attribute"],
                frame_name)
        print(result)

    sys.stdout.flush()
