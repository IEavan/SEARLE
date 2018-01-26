""" Script to test how to interface data between Node and Python
script based on https://www.sohamkamani.com/blog/2015/08/21/python-nodejs-comm/"""

# Imports
import sys

def echo_input():
    """ Simple function to read stdin and echo that to stdout """
    lines = sys.stdin.readlines()
    print(lines)

if __name__ = "__main__":
    echo_input()
