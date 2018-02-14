""" Python script for the gathering and storing of information collected
from the london stock exchange website. Information stored includes
volume, spot price, high, low, market cap. This information
is then stored in a csv for access by other scripts """

# Imports
import numpy as np
import requests
from bs4 import BeautifulSoup

# Constants
BASE_URL = "http://www.londonstockexchange.com/exchange/prices-and-markets/stocks/summary/company-summary/"

class LSE_Reader():
    """ Class for interaction with the london stock exchange """

    def __init__(self, name_resolution_file="data/names_to_codes.csv"):
        """ Creates dictionary for mapping stock tickers to url codes """
        self.names_to_codes = {}
        with open(name_resolution_file, 'r') as f:
            for line in f:
                ticker, url_code = line.strip().split(',')
                self.names_to_codes[ticker] = url_code

    def cache_LSE(self, file_name):
        pass

    def read_stock(self, ticker):
        url = BASE_URL + self.names_to_codes[ticker] + ".html"
        response = requests.get(url)
        if response.status_code != 200:
            return -1
        else:
            html = BeautifulSoup(response.text, 'html.parser')
            html = html.find(id="pi-colonna1-display")
            html = html.find("tbody")
            data_items = html.find_all("td")

            price  = float(data_items[1].string.replace(',', ''))
            high   = float(data_items[5].string.replace(',', ''))
            low    = float(data_items[7].string.replace(',', ''))
            volume = float(data_items[9].string.replace(',', ''))

            return price, high, low, volume

if __name__ == "__main__":
    reader = LSE_Reader()
    print(reader.read_stock("III"))
    print("Success")
