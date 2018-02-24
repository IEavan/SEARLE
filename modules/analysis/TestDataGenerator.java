import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;

import java.io.IOException;
import java.util.*;



public class TestDataGenerator
{
	/* Passed in (JSON):
		amount of .csv's
		time difference between .csv's
		Type of test (upward/downward trend, abnormality: spike/dip)

		[numCSVs, timeDiff, concurrentTests:[upward, spike, ...]]

		for EACH i in 1...numCSVs
			for EACH j in 1...num(concurrentTests)
				generate test data based upon previous
				store as 'previous data'
			fill out normal data
			write to file


	Data format:
		.csv files
		unix time stamp in the name
		(see frames directory)

	POA:

	*/
	static List<String> tickers = new ArrayList<String>();
	static List<Double> testData = new ArrayList<Double>();	// contains generated abnormal data
	static List<Company> data = new ArrayList <Company>();
	static int numCSVs;
	static int unixTimeDiff;
	static int unixTimeStart;

    public static void main(String[] args)
    {
		getCodes();					// Initialise the program, import the stock tickers
		printTickers();				// Proves getCodes() above works;


		// ================== static data ==================
		//due to be changed when can receive JSON data
		//for now, change the values labelled 'EDITTHIS' to customise the tests
		numCSVs = 20;	// EDITTHIS
		unixTimeDiff = 5 * 60 * 1000; // EDITTHIS: first value is minutes (currently five minutes)
		unixTimeStart = 1519412007;	// EDITTHIS

		// UPWARD TREND: 	1
		// DOWNARD TREND: 	2
		// ABNORMAL SPIKE:	3
		// ABNORMAL DIP: 	4

		// If spiking or dipping, set spike value here:
		double spikeVal = 9000;	//EDITTHIS with a positive value, regardless of spike direction

		// If trending upwards or downwards, set average difference value here:
		double niceTrendDiff = 100;  // EDITTHIS with a positive value, regardless of trend direction


		int[] tests = new int[1];		// not currently capable of multiple tests at a time

		// Set test type here:
		tests[0] = 3;			// EDITTHIS to alter type of test performed
		String[] testOn = new String[1];

		// Set company to apply test to here:
		testOn[0] = "III"; 		// EDITTHIS to valid company. Testing on one specific company


		// =====================================================================

		// First, create multiple company objects
		for (int i=0; i<tickers.size(); i++){
			data.add(i, new Company(numCSVs, tickers.get(i)));
			//System.out.println(numCSVs+", "+tickers.get(i));
		}

		// Second, generate data for the company to test on

		// generate pricing data
		Random r = new Random();
		double priceVal = 100 + (5000 - 100) * r.nextDouble();
		double prevPV;

		// if spike or dip:
		boolean spikedYet = false;
		int countToSpikeOn = (int) Math.ceil( ((int)numCSVs) / 2) + 3;
		System.out.println("Spiking on "+countToSpikeOn);


		// upwards / spike = 1. downwards / dip = -1
		int posNeg = 1;
		if (tests[0]%2==0){
			posNeg = -1;
		}

		System.out.println("Generating Abnormal Data");
		for (int i=0; i<numCSVs; i++){
			testData.add(priceVal);
			prevPV = priceVal;
			// generate next value
			switch (tests[0]){
				case 1: case 2:
				// up / down trend
				double changeBy = niceTrendDiff + Math.random() * (50); // trend difference varies each time
				priceVal = prevPV + (posNeg*changeBy);
				System.out.println("Trending: changeBy = "+changeBy+", priceVal = "+priceVal);
				break;


				case 3: case 4:
				// abnormal spike / dip
				if (i==countToSpikeOn){ // if time to spike
                	priceVal = prevPV + (posNeg*spikeVal);
					System.out.println("SPIKED! Spike value is "+priceVal);
				} else if (i>countToSpikeOn){
					priceVal = prevPV + niceTrendDiff + Math.random() * (50);
					System.out.println("Post spike. Value is "+priceVal);
				} else {
					// normal bumping about
					changeBy = Math.random() * 50;
					if (Math.random()< 0.5){
						priceVal = prevPV + changeBy;
					} else {
						priceVal = prevPV - changeBy;
					}
					System.out.println("Unspiked, value is "+priceVal);
				}
				break;

				default:
			}
			//System.out.println(priceVal);



		}

		//System.out.println(findIndexInDataOfCompany("III"));


		// update company frames with new Data
		putThisDataIntoThisCompany(testData,testOn[0]);

		// have frames fill out normal data nicely

		for (int i=0; i<tickers.size(); i++){
			if (!tickers.get(i).equals(testOn[0])){
				fillNormal(tickers.get(i));
				//System.out.println("NOT TestOn");
			} else {
				//System.out.println("TestOn");
			}
		}

		// fill other normal companies with normal looking data

		for (int i=0; i<tickers.size(); i++){
			fillOutOtherFrameData(tickers.get(i));
		}


		// write to file, do the magic

		for (int i=0; i<numCSVs; i++){
			writeOneFile(i);
		}











    }

	private static int findIndexInDataOfCompany(String ticker){
		for (int i=0; i<data.size(); i++){
			if (data.get(i).getTicker().equals(ticker)){
				return i;
			}
		}
		return -1;
	}


	private static void putThisDataIntoThisCompany(List<Double> testData, String compCode){
		// Given the generated range of test prices:
		// extract each price from the list
		// put each price into its individual frame

		int index = findIndexInDataOfCompany(compCode);

		for (int i=0; i<testData.size(); i++){
			// System.out.println("Index: "+index+", i: "+i);
			// System.out.println(data.get(index));
			// System.out.println(testData.get(i));
			// System.out.println(data.get(index).getSpecificFrame(i));
			data.get(index).getSpecificFrame(i).setPrice(testData.get(i));
			// data.get(index).frames[i].price = testData.get(i);
			// System.out.println(data.get(i).frames[i].price+" SET TO "+testData.get(i));
		}


	}


	private static void fillOutOtherFrameData(String compCode){
		// CALCULATE High	Low	Volume	Last_Close	Absolute_Change	Percentage_Change FROM PRICE
		// Called once all prices have been put in

		// index of company to fill frames
		int index = findIndexInDataOfCompany(compCode);

		// for FIRST FRAME (frame 0) only:
		// get price
		double price = data.get(index).getSpecificFrame(0).getPrice();
		double lastPrice = price;

		// generate a low
		double low = price - Math.random() * 3;
		data.get(index).getSpecificFrame(0).setLow(low);
		//System.out.println("Generated low: "+low);

		// generate a high
		double high = price + Math.random() * 3;
		data.get(index).getSpecificFrame(0).setHigh(high);
		//System.out.println("Generated high: "+high);

		// generate random volume
		Random randomGenerator = new Random();
		int volume = randomGenerator.nextInt(9000000 - 1000000 + 1) + 1000000;
		data.get(index).getSpecificFrame(0).setVolume(volume);
		//System.out.println("Generated volume: "+volume);

		// create last close
		double lastClose = price + (high + low);
		data.get(index).getSpecificFrame(0).setLast_Close(lastClose);
		//System.out.println("Generated LastClose: "+lastClose);

		// calculate absolute change
		double absChange = price - lastClose;
		data.get(index).getSpecificFrame(0).setAbsolute_Change(absChange);
		//System.out.println("AbsChange: "+absChange);

		// calculate percentage change
		double perChange = (absChange/lastClose) * 100;
		data.get(index).getSpecificFrame(0).setPercentage_Change(perChange);
		//System.out.println("PerChange: "+perChange);

		// set timestamp to unixTimeStart
		data.get(index).getSpecificFrame(0).setTimestamp(unixTimeStart);

		int time;
		int lastTime = unixTimeStart;




		for (int i=1; i<numCSVs; i++){
			// volume never changes
			data.get(index).getSpecificFrame(i).setVolume(volume);

			// last close never changes
			data.get(index).getSpecificFrame(i).setLast_Close(lastClose);

			// get price
			price = data.get(index).getSpecificFrame(i).getPrice();

			// update low/high if necessary
			if (price > high){
				high = price;
			}
			data.get(index).getSpecificFrame(i).setHigh(high);
			if (price < low){
				low = price;
			}
			data.get(index).getSpecificFrame(i).setLow(low);

			// calculate absolute change
			absChange = price - lastClose;
			data.get(index).getSpecificFrame(i).setAbsolute_Change(absChange);

			// calculate percentage change
			perChange = (absChange/lastClose) * 100;
			data.get(index).getSpecificFrame(i).setPercentage_Change(perChange);

			// generate timeStamp
			time = lastTime + unixTimeDiff;
			data.get(index).getSpecificFrame(i).setTimestamp(time);
			lastTime = time;
		}

	}





	private static void printTickers(){
		for (String s : tickers) {
        	//System.out.println(s);
    	}
	}

	private static void getCodes(){
		System.out.println("Extracting Stock Tickers");
		// Extracts stock tickers for use within this program

		String csvFile = System.getProperty("user.dir")+"/data/names_to_codes.csv";
		BufferedReader br = null;
		String line = "";
		String cvsSplitBy = ",";

		try {

			br = new BufferedReader(new FileReader(csvFile));
			while ((line = br.readLine()) != null) {
				String[] tickerncode = line.split(cvsSplitBy);

				//System.out.println("[Ticker = " + tickerncode[0] + " , code=" + tickerncode[1] + "]");
   				tickers.add(tickerncode[0]);

			}

		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}
	}


	private static void fillNormal(String ticker){
		// generates normal prices for the other companies
		List<Double> normalData = new ArrayList<Double>();

		Random r = new Random();
		double priceVal = 100 + (10000 - 100) * r.nextDouble();	// random starting value, between 100 and 1000
		double prevPV;
		for (int i=0; i<numCSVs; i++){
			normalData.add(priceVal);
			prevPV = priceVal;
			double changeBy = Math.random() - 0.5 * 10;
			priceVal = prevPV + changeBy;
		}

		putThisDataIntoThisCompany(normalData,ticker);
		//System.out.println("\n\nFilled "+ticker);



	}

	private static void writeOneFile(int j){
		// writes generated frame to file
		// j is the index of frames to refer to
		FileWriter filewriter = null;
		try {
			String fileName = System.getProperty("user.dir")+"/data/test_frames/"+data.get(0).getSpecificFrame(j).getTimestamp()+"-frame.csv";
			filewriter = new FileWriter(fileName);

			String str="Ticker, Price, High, Low, Volume, Last_Close, Absolute_Change, Percentage_Change\n";
			for (int i=0; i<data.size(); i++){
				//data.get(i).getSpecificFrame(j)....
				str+="'"+data.get(i).getTicker()+"',";
				str+=data.get(i).getSpecificFrame(j).getPrice()+",";
				str+=data.get(i).getSpecificFrame(j).getHigh()+",";
				str+=data.get(i).getSpecificFrame(j).getLow()+",";
				str+=data.get(i).getSpecificFrame(j).getVolume()+",";
				str+=data.get(i).getSpecificFrame(j).getLast_Close()+",";
				str+=data.get(i).getSpecificFrame(j).getAbsolute_Change()+",";
				str+=data.get(i).getSpecificFrame(j).getPercentage_Change()+",";

				if (i<(data.size()-1)){
					str+="\n";
				}
			}
			filewriter.append(str);
		} catch (Exception e) {
			System.out.println("Error in CsvFileWriter !!!");
			e.printStackTrace();
		} finally {

			try {
				filewriter.flush();
				filewriter.close();
			} catch (IOException e) {
				System.out.println("Error while flushing/closing fileWriter !!!");
                e.printStackTrace();
			}

		}
	}
}



class Company{
	public String ticker;
	public int testType;
	OneFrame[] frames;
	// if testType -1, then this company is performing normally

	public Company(int numFrames, String ticker){
		this.ticker = ticker;
		this.frames = new OneFrame[numFrames];
		for (int i=0; i<numFrames; i++){
			frames[i]= new OneFrame(i);
		}
	}

	public String getTicker(){
		return this.ticker;
	}

	public OneFrame getSpecificFrame(int i){
		return frames[i];
	}


}

class OneFrame{
	public int count;
	public double price;
	public double high;
	public double low;
	public int volume;
	public double last_Close;
	public double absolute_Change;
	public double percentage_Change;
	public long timeStamp;

	public OneFrame(int count){
		this.count = count;
	}

	public OneFrame(double price, double high, double low, int volume, double last_Close, double absolute_Change, double percentage_Change, long timeStamp, int count){
		this.price = price;
		this.high = high;
		this.low = low;
		this.volume = volume;
		this.last_Close = last_Close;
		this.absolute_Change = absolute_Change;
		this.percentage_Change = percentage_Change;
		this.timeStamp = timeStamp;
		this.count = count;
	}

	public void setPrice(double price){
		this.price=price;
	}

	public double getPrice(){
		return this.price;
	}

	public void setHigh(double high){
		this.high=high;
	}

	public double getHigh(){
		return this.high;
	}

	public void setLow(double low){
		this.low=low;
	}

	public double getLow(){
		return this.low;
	}

	public void setVolume(int volume){
		this.volume=volume;
	}

	public double getVolume(){
		return this.volume;
	}

	public void setLast_Close(double last_Close){
		this.last_Close=last_Close;
	}

	public double getLast_Close(){
		return this.last_Close;
	}

	public void setAbsolute_Change(double absolute_Change){
		this.absolute_Change=absolute_Change;
	}

	public double getAbsolute_Change(){
		return this.absolute_Change;
	}

	public void setPercentage_Change(double percentage_Change){
		this.percentage_Change=percentage_Change;
	}

	public double getPercentage_Change(){
		return this.percentage_Change;
	}

	public void setTimestamp(long timeStamp){
		this.timeStamp=timeStamp;
	}

	public long getTimestamp(){
		return this.timeStamp;
	}

	public int getCount(){
		return this.count;
	}

}
