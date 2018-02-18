""" This module provides functionality for interacting with
the stored stock frames and formatting the information """

# Imports
import os
import time

class Stock_Reader():
    def __init__(self, data_path="./data/frames"):
        self.data_path = data_path
        self.files = os.listdir(data_path)
        self.current_frame = self.files[-1]

    def get_attribute(self, ticker, attribute, frame):
        """ function for accessing the most recent simple attribute of a stock """
        # format inputs
        attribute = attribute.lower()
        ticker = ticker.upper()

        with open(frame, 'r') as f:
            for line in f:
                _ticker, price, high, low, volume = line.strip().split(',')
                _ticker = _ticker.strip("'")
                if _ticker == ticker:
                    if attribute == "price":
                        return float(price)
                    if attribute == "high":
                        return float(high)
                    if attribute == "low":
                        return float(low)
                    if attribute == "volume":
                        return float(volume)
                    else:
                        raise ValueError("attribute " + attribute + "does not exist"
                                + "allowed values are {price, high, low, volume}")

    def frame_to_unix_time(self, file_name):
        file_name = os.basename(file_name)
        return int(file_name[:-10])

    def unix_time_to_frame(self, utime, base_path=None):
        name = str(utime) + "-frame.csv"
        if base_path is not None:
            return os.path.join(base_path, name)
        else:
            return name

    def get_closest_frame(self, target_utime):
        closest = None
        min_dist = -1
        for utime in [self.frame_to_unix_time(name) for name in self.files]:
            dist = abs(utime - target_utime)
            if dist < min_dist:
                min_dist = dist
                closest = self.unix_time_to_frame(utime)
        return closest

    def get_current_attribute(self, ticker, attribute):
        frame = os.path.join(self.data_path, self.current_frame)
        return get_attribute(ticker, attribute, frame)

    def get_attribute_range(self, ticker, attribute, start_time, end_time=None):
        frame_times = [int(name[:-10]) for name in self.files]
        frame_times.sort()
        
        start_index = 0
        end_index = len(frame_times)

        for utime in frame_times:
            if start_time < utime:
                break
            else:
                start_index += 1
        
        if end_time is not None:
            frame_times.reverse()
            for utime in frame_times:
                if end_time > utime:
                    break
                else:
                    end_index -= 1

        valid_time_range = frame_times[start_index:end_index]
        frame_names = [self.unix_time_to_frame(utime, "./data/frames") 
                for utime in valid_time_range]

        return [self.get_attribute(ticker, attribute, frame) for frame in frame_names]

if __name__ == "__main__":
    reader = Stock_Reader()
    # print(reader.get_current_attribute('III', 'price'))
    print(reader.get_attribute_range('III', 'price', 1518927641, 1518928370))
