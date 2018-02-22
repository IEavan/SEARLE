""" This module provides functionality for interacting with
the stored stock frames and formatting the information """

# Imports
import os
import time

class Stock_Reader():
    """ Class for reading specific data from the stock frames
    generated by the webscraper """

    def __init__(self, data_path="./data/frames"):
        """ Read all the file names in the specified data directory """
        self.data_path = data_path
        self.files = os.listdir(data_path)
        self.current_frame = self.files[-1]

    def get_attribute(self, ticker, attribute, frame):
        """ Access a simple attribute of a stock from a given frame """
        # format inputs
        attribute = attribute.lower().replace(' ', '_')
        ticker = ticker.upper()
        found = False

        with open(frame, 'r') as f:
            for line in f:
                _ticker, price, high, low, volume, last_close, abs_change, per_change = line.strip().split(',')
                _ticker = _ticker.strip("'")
                if _ticker == ticker:
                    found = True

                    if attribute == "price":
                        return float(price)
                    if attribute == "high":
                        return float(high)
                    if attribute == "low":
                        return float(low)
                    if attribute == "volume":
                        return float(volume)
                    if attribute == "last_close" or attribute == "open":
                        return float(last_close)
                    if attribute == "abs_change" or attribute == "absolute_change":
                        return float(abs_change)
                    if attribute == "per_change" or attribute == "percentage_change":
                        return float(per_change)
                    else:
                        raise ValueError("attribute " + attribute + "does not exist"
                                + "allowed values are {price, high, low, volume, last_close, abs_change, per_change}")
        if not found:
            return -1

    def frame_to_unix_time(self, file_name):
        """ Convert a file name to a unix timestamp """
        file_name = os.basename(file_name)
        return int(file_name[:-10])

    def unix_time_to_frame(self, utime, base_path=None):
        """ Convert a unix timestamp to a filename """
        name = str(utime) + "-frame.csv"
        if base_path is not None:
            return os.path.join(base_path, name)
        else:
            return name

    def get_closest_frame(self, target_utime):
        """ Find the filename of the frame generated at a time closest to the target time """
        closest = None
        min_dist = -1
        for utime in [self.frame_to_unix_time(name) for name in self.files]:
            dist = abs(utime - target_utime)
            if dist < min_dist:
                min_dist = dist
                closest = self.unix_time_to_frame(utime)
        return closest

    def get_current_attribute(self, ticker, attribute):
        """ Get a simple attribute of a stock from the most recent time frame """
        frame = os.path.join(self.data_path, self.current_frame)
        return self.get_attribute(ticker, attribute, frame)

    def get_attribute_range(self, ticker, attribute, start_time, end_time=None):
        """ Get a list of values for an attribute in chronological order
        from the specified start time to the specified end time (not inclusive).
        If no end time is specified, the list goes up to the current time. """
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
        frame_names = [self.unix_time_to_frame(utime, self.data_path)
                for utime in valid_time_range]

        return [self.get_attribute(ticker, attribute, frame) for frame in frame_names]

if __name__ == "__main__":
    reader = Stock_Reader()
    print(reader.get_current_attribute('III', 'abs_change'))
