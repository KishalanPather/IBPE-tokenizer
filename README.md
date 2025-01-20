# Accessing the github link
Please allow 1-3 minutes for the backend servers to connect. You will know it is connected when the "default tokenizer" is displayed.

# Running the program
1. In order to run this program, You will need to have node.js and flask for python installed on your computer. You can find these online. 
2. Once these are downloaded you can navigate to the backend folder and run: “npm install” in the terminal. This will download all the libraries and modules used. However if this does not work, then you can individually install the packages including: express.js, cors, mongoose, flask and flask_cors.
3. Then run "pip install flask" which should prompt you to create a virtual environment. Allow it. Then run "pip install flask_cors". 
4. Next you must set up the express server by navigating to the backend folder and running “node server” in the terminal. This will start up the server.
5. Next set up the python server. Navigate to the python file “service.py” and click run. This will set up the server as well. 
6. Now open the index.html file a browser of your choice and the program should work perfectly.

# Using the tokenizing text field
On startup. You will be greeted with this interface. By default, there is a default tokenizer available for the user to immediately start tokenizing text. 
The user can type text into the text field and then press the “Tokenize” button.
This will start the tokenizing process, output statistics and tokenized text like below:


## The example button
If the user is confused on how the application works, clicking the example button will put data into the textfield, using the currently selected tokenizer. It automatically tokenizes the text so the user can see how the application works.


# Using the input Training file button
If the user wants to train a vocabulary using their own corpus(text used for training) then they can click the “input training file” button. 
The user can then type in a tokenizer name(which must be unique), specify the vocabulary size and input a text file and then hit train.
The user can also delete tokenizers as they wish by clicking on the  X next to the tokenizer option.


# Using the input tokenizing file button
If the user wishes to tokenize a text file, they may select the “input tokenizing file” button.
The user must input a file name, select one of the available tokenizers and a text file and then click tokenize. 


A download option is available if the user would like to download the tokenized file. Analytics for the tokenized file are available however, the text is not displayed at the bottom as with big files, this slows down the browser and the user’s computer significantly.
