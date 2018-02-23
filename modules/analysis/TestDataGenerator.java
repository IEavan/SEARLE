import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
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
	static List<Object> data = new ArrayList <Object>();

    public static void main(String[] args)
    {
		getCodes();					// Initialise the program, import the stock tickers
		printTickers();				// Proves getCodes() above works;


		// ================== static data ==================
		//due to be changed when can receive JSON data
		//for now, change the values labelled 'EDITTHIS' to customise the tests
		int numCSVs = 10;	// EDITTHIS
		int unixTimeDiff = 5 * 60 * 1000; // EDITTHIS: first value is minutes (currently five minutes)
		int unixTimeStart = 1519412007;	// EDITTHIS

		// UPWARD TREND: 	1
		// DOWNARD TREND: 	2
		// ABNORMAL SPIKE:	3
		// ABNORMAL DIP: 	4

		// If spiking or dipping, set spike value here:
		double spikeVal = 1000;	//EDITTHIS with a positive value, regardless of spike direction

		// If trending upwards or downwards, set average difference value here:
		double niceTrendDiff = 100;  // EDITTHIS with a positive value, regardless of trend direction


		int[] tests = new int[1];		// not currently capable of multiple tests at a time

		// Set test type here:
		tests[0] = 1;			// EDITTHIS to alter type of test performed
		String[] testOn = new String[1];

		// Set company to apply test to here:
		testOn[0] = "III"; 		// EDITTHIS to valid company. Testing on one specific company


		// =====================================================================

		// First, create multiple company objects
		for (int i=0; i<tickers.size(); i++){
			data.add(new Company(numCSVs, tickers.get(i)));
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
;
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
					System.out.println("SPIKED!");
				} else {
					// normal bumping about
					changeBy = Math.random() * 50;
					if (Math.random()< 0.5){
						priceVal = prevPV + changeBy;
					} else {
						priceVal = prevPV - changeBy;
					}
				}
				break;

				default:
			}
			System.out.println(priceVal);

		}




		// TODO: update company frames with new Data
		// have frames fill out rest of data nicely
		// fill other normal companies with normal looking data











    }


	private static void putThisDataIntoThisCompany(List<Double> testData, String compCode){

	}


	private static void fillOutOtherFrameData(String compCode){
		// CALCULATE High	Low	Volume	Last_Close	Absolute_Change	Percentage_Change FROM PRICE
	}





	private static void printTickers(){
		for (String s : tickers) {
        	System.out.println(s);
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

				System.out.println("[Ticker = " + tickerncode[0] + " , code=" + tickerncode[1] + "]");
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


	private static void fillNormal(String ticker){}

	private static void writeOneFile(){
		// writes generated data to file
	}
}



class Company{
	public String ticker;
	public int testType;
	oneFrame[] frames;
	// if testType -1, then this company is performing normally

	public Company(int numFrames, String ticker){
		this.ticker = ticker;
		this.frames = new oneFrame[numFrames];
	}
}

class oneFrame{
	public int count;
	public double price;
	public double high;
	public double low;
	public int volume;
	public double last_Close;
	public double absolute_Change;
	public double percentage_Change;
	public int timeStamp;

	public oneFrame(double price, double high, double low, int volume, double last_Close, double absolute_Change, double percentage_Change, int timeStamp, int count){
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

}
