Dear Ralph,
    If you are reading this, then it means you have found the
directory where I want you to put the fake stock data (test_frames).
The data should be formatted as csv files with a unix time
stamp in the name to signal the time the data relates to.
For an example of what these files should look like then
have a look at the frames directory which is a sibling
to this directory.

There should be an empty java file in analysis where you
can write all the java code. The code should read in
json from stdin and parse this for arguments as to
what data to generate, you might want to talk to aaron
about how that json will be structured exactly ;)
