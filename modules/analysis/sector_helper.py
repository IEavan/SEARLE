""" Script to make a csv with all sectors and their respective stocks """

# Imports
import json

with open("../data/FTSEListings.json", 'r') as f:
    data = json.load(f)

sector2tickers = {}
for company in data["lookup"]["company"].values():
    try:
        sector2tickers[company["ftse sector"]].append(company["ticker"])
    except KeyError:
        sector2tickers[company["ftse sector"]] = [company["ticker"]]

ticker2sector = {}
for sector in sector2tickers:
    for ticker in sector2tickers[sector]:
        ticker2sector[ticker] = sector
