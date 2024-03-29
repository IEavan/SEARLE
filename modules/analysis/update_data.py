""" Python script for the gathering and storing of information collected
from the london stock exchange website. Information stored includes
volume, spot price, high, low, market cap. This information
is then stored in a csv for access by other scripts """

# Imports
import requests
import time
from bs4 import BeautifulSoup
from tqdm import tqdm # TODO Remove this line :p

from ai import Sentiment_Analyzer

# Constants
BASE_URL = "http://www.londonstockexchange.com/exchange/prices-and-markets/stocks/summary/company-summary/"
CSV_HEADER = "Ticker, Price, High, Low, Volume, Last_Close, Absolute_Change, Percentage_Change, Market_Cap"

NEWS_URLS = {
        "stockmarketwire":"http://www.stockmarketwire.com/company-news/?epic=",
        "yahoo":"https://uk.finance.yahoo.com/quote/"
}

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

    def check_add_dot(self, ticker):
        """ Checks if the ticker should have a dot appened
        and returns the correct ticker if that's the case """
        for proper_ticker in self.names_to_codes.keys():
            if ticker.replace('.','') == proper_ticker.replace('.',''):
                return str(proper_ticker)

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
        for ticker in tqdm(self.names_to_codes.keys()): # TODO remove tqdm
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
            # Parse html for basic attributes
            html = BeautifulSoup(response.text, 'html.parser')
            table1 = html.find(id="pi-colonna1-display")
            table1 = table1.find("tbody")
            data_items = table1.find_all("td")

            # Extract numerical data and remove ',' thousands seperator
            price  = float(data_items[1].string.replace(',', ''))
            high   = float(data_items[5].string.replace(',', ''))
            low    = float(data_items[7].string.replace(',', ''))
            volume = float(data_items[9].string.replace(',', ''))
            last_close = float(data_items[11].string.split(' ')[0].replace(',',''))

            abs_change = round(price - last_close, 2)
            per_change = round(((price / last_close) - 1) * 100, 2)

            # Parse to find market cap
            table2 = html.find(id="pi-colonna2").find("tbody")
            table2_data = table2.find_all("td")
            market_cap = float(table2_data[5].string.replace('£','').replace(',',''))

            return ticker, price, high, low, volume, last_close, abs_change, per_change, market_cap

    def read_news(self, ticker, limit_per_source=10):
        ticker = self.check_add_dot(ticker)
        sentiment = Sentiment_Analyzer()

        def get_stockmarketwire_news():
            # Get stockmarketwire (smw) news
            smw_url = NEWS_URLS["stockmarketwire"] + ticker
            news_list = []

            response = requests.get(smw_url)
            if response.status_code != 200:
                return news_list
            else:
                try:
                    # Parse html
                    html = BeautifulSoup(response.text, "html.parser")
                    li_list = html.find(id="content").find_all("li")

                    for i, li in enumerate(li_list):
                        news = {}
                        time_text = li.div.text.strip()
                        try: # Try parsing the full date
                            time_published = time.mktime(time.strptime(time_text + " 2018", "%d %b%H:%M %Y"))
                            if time_published > time.time():
                                time_published = time.mktime(time.strptime(time_text + " 2017", "%d %b%H:%M %Y"))
                        except (ValueError):
                            pass
                        try:
                            time_today = time.mktime(time.strptime(time.strftime("%x"), "%m/%d/%y"))
                            time_offset = time.mktime(time.strptime(time_text + " 1970", "%H:%M %Y"))
                            time_published = time_today + time_offset
                        except (ValueError):
                            time_published = 0

                        a_tag = li.find("a")
                        title = a_tag.text
                        link = "www.stockmarketwire.com" + a_tag.attrs["href"]
                        body = li.find("p").text.strip()

                        news["time_published"] = time_published
                        news["url"] = link
                        news["title"] = title
                        news["body"] = body

                        news_list.append(news)

                        if (i + 1) >= limit_per_source:
                            break
                    return news_list
                except:
                    return []

        def get_yahoo_news():
            yahoo_url = NEWS_URLS["yahoo"] + ticker.upper() + ".L"
            news_list = []

            response = requests.get(yahoo_url)
            if response.status_code != 200:
                # Parse html
                html = BeautifulSoup(response.text, "html.parser")
                li_list = html.find(id="content").find_all("li")

                for i, li in enumerate(li_list):
                    news = {}
                    time_text = li.div.text.strip()
                    try: # Try parsing the full date
                        time_published = time.mktime(time.strptime(time_text + " 2018", "%d %b%H:%M %Y"))
                        if time_published > time.time():
                            time_published = time.mktime(time.strptime(time_text + " 2017", "%d %b%H:%M %Y"))
                    except (ValueError):
                        pass
                    try:
                        time_today = time.mktime(time.strptime(time.strftime("%x"), "%m/%d/%y"))
                        time_offset = time.mktime(time.strptime(time_text + " 1970", "%H:%M %Y"))
                        time_published = time_today + time_offset
                    except (ValueError):
                        time_published = 0

                    a_tag = li.find("a")
                    title = a_tag.text
                    link = "www.stockmarketwire.com" + a_tag.attrs["href"]
                    body = li.find("p").text.strip()

                    news["time_published"] = time_published
                    news["url"] = link
                    news["title"] = title
                    news["body"] = body

                    news_list.append(news)

                    if (i + 1) >= limit_per_source:
                        break
                return news_list
            else:
                try:
                    html = BeautifulSoup(response.text, "html.parser")
                    container = html.find(id="quoteNewsStream-0-Stream")
                    li_list = container.find_all("li")

                    for i, li in enumerate(li_list):
                        news = {}
                        source_time = li.find("span").parent.find_all("span")
                        source = source_time[0].text
                        time_text = source_time[1].text

                        a_tag = li.find("a")
                        link = "https://uk.finance.yahoo.com" + a_tag.attrs["href"]
                        title = a_tag.text

                        body = li.find("p").text

                        news["time_published"] = time_text
                        news["url"] = link
                        news["title"] = title
                        news["body"] = body

                        news_list.append(news)

                        if (i + 1) >= limit_per_source:
                            break

                    return news_list
                except:
                    return []

        news_list = get_stockmarketwire_news()
        news_list.extend(get_yahoo_news())

        for news in news_list:
            news["sentiment"] = sentiment.analyze(news["body"])

        return news_list


if __name__ == "__main__":
    # On run create a new frame
    reader = LSE_Reader()
    reader.create_stocks_frame()
