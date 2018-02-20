""" Python script for the gathering and storing of information collected
from the london stock exchange website. Information stored includes
volume, spot price, high, low, market cap. This information
is then stored in a csv for access by other scripts """

# Imports
import requests
import time
from bs4 import BeautifulSoup

# Constants
BASE_URL = "http://www.londonstockexchange.com/exchange/prices-and-markets/stocks/summary/company-summary/"
CSV_HEADER = "Ticker, Price, High, Low, Volume"

class LSE_Reader():
    """ Class for interaction with the london stock exchange 
    and writing data to files """

    def __init__(self, name_resolution_file="data/names_to_codes.csv"):
        """ Creates dictionary for mapping stock tickers to url codes """
        self.names_to_codes = {}
        with open(name_resolution_file, 'r') as f:
            for line in f:
                ticker, url_code = line.strip().split(',')
                self.names_to_codes[ticker] = url_code

    def create_stocks_frame(self, base_path="./data/frames/"):
        """ Dumps the current LSE stock information into a file.
        The location is specified by base_path and the name
        includes the unix time of the lookup """

        # Create name
        timestamp = int(time.time())
        file_name = base_path + str(timestamp) + "-frame.csv"

        stock_data = self.read_all_stocks()
        with open(file_name, 'w+') as f:
            f.write(CSV_HEADER + "\n")
            for line in stock_data:
                f.write(str(line)[1:-1]) #Strip '(' and ')' from tuple and write
                f.write('\n')

    def read_all_stocks(self):
        """ Iterate over all stock ticker found upon init """
        results = []
        for ticker in self.names_to_codes.keys():
            results.append(self.read_stock(ticker))
        return results

    def read_stock(self, ticker):
        """ Scrapes LSE for basic information about a specified stock """
        # Fetch response
        url = BASE_URL + self.names_to_codes[ticker] + ".html"
        response = requests.get(url)

        # Verify success code
        if response.status_code != 200:
            return -1
        else:
            # Parse html
            html = BeautifulSoup(response.text, 'html.parser')
            html = html.find(id="pi-colonna1-display")
            html = html.find("tbody")
            data_items = html.find_all("td")

            # Extract numerical data and remove ',' thousands seperator
            price  = float(data_items[1].string.replace(',', ''))
            high   = float(data_items[5].string.replace(',', ''))
            low    = float(data_items[7].string.replace(',', ''))
            volume = float(data_items[9].string.replace(',', ''))

            return ticker, price, high, low, volume

if __name__ == "__main__":
    # On run create a new frame
    reader = LSE_Reader()
    reader.create_stocks_frame()
    print("Success")
