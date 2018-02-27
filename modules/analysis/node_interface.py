""" Script to test how to interface data between Node and Python
script based on https://www.sohamkamani.com/blog/2015/08/21/python-nodejs-comm/

Script expects to recieve a json through stdin to determine which actions to take
and communicates back on stdout"""

# Imports
import json
import sys

import frame_reader
import update_data
import sector_helper

if __name__ == "__main__":
    # Load json arguments passed in from node
    input_args = json.loads(sys.stdin.readline())

    response = {}
    response["result"] = {}
    response["request"] = input_args
    response["error"] = {}

    # Init the data frame reader for easy data access
    try:
        use_test_data = input_args["use_test_data"].lower()
    except (KeyError):
        use_test_data = "false"

    if use_test_data == "true":
        reader = frame_reader.Stock_Reader(data_path="./data/test_frames")
    else:
        reader = frame_reader.Stock_Reader()

    request_type_understood = False

    # ------------- Handle each type of request specified in the json ------------------#

    # get current attribute
    if input_args["request_type"] == "get_current_attribute":
        request_type_understood = True

        result = -1
        if "ticker" in input_args:
            result = reader.get_current_attribute(
                    input_args["ticker"],
                    input_args["attribute"])
        elif "group" in input_args:
            if input_args["group"]["type"] == "sector":
                result = reader.get_current_sector_attribute(
                        input_args["group"]["sector_name"],
                        input_args["attribute"])

        if result != -1:
            response["result"]["value"] = result
        elif "ticker" in input_args:
            response["error"]["message"] = "Stock with ticker '" + \
                    input_args["ticker"] + "' was not found"
            response["error"]["type"] = "ValueError"
        elif "group" in input_args:
            response["error"]["message"] = "Sector with name '" + \
                    input_args["group"]["sector_name"] + "' was not found"
            response["error"]["type"] = "ValueError"

    # get attribute from specified time
    if input_args["request_type"] == "get_attribute":
        request_type_understood = True
        frame_name = reader.get_closest_frame(input_args["start_time"])

        result = -1

        if "ticker" in input_args:
            result = reader.get_attribute(
                    input_args["ticker"],
                    input_args["attribute"],
                    frame_name)
        elif "group" in input_args:
            if input_args["group"]["type"] == "sector":
                result = reader.get_sector_attribute(
                        input_args["group"]["sector_name"],
                        input_args["attribute"],
                        frame_name)
        
        if result != -1:
            response["result"]["value"] = result
        elif "ticker" in input_args:
            response["error"]["message"] = "Stock with ticker '" + \
                    input_args["ticker"] + "' was not found"
            response["error"]["type"] = "ValueError"
        elif "group" in input_args:
            response["error"]["message"] = "Sector with name '" + \
                    input_args["group"]["sector_name"] + "' was not found"
            response["error"]["type"] = "ValueError"
    
    # get news on a certain company
    if input_args["request_type"] == "get_news":
        request_type_understood = True
        try:
            limit_per_source = int(input_args["limit_per_source"])
        except (KeyError):
            limit_per_source = 10

        scraper = update_data.LSE_Reader()
        result = scraper.read_news(input_args["ticker"], limit_per_source)
        
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
