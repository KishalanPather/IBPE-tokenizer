import time

class BPETokenizer:                         # class which is responsible for tokenizing text
    
    # constructor for the BPETokenizer class
    def __init__(self, corpus,vocabulary):
        self.corpus = corpus                    # this is the input text which will be tokenized
        self.vocabulary = vocabulary            # this is the tokenizers vocabulary which will be used for tokenizing text
        self.dictionary = {}                    # dictionary to keep track of all the adjacent pairs of characters and strings within the corpus, and the indexes they can be found at
        self.deletedIndices = set()                 # this set is used to keep track of all the indexes which have been "deleted" from the corpus
        self.inputTxt = list(self.corpus)           # saves the corpus as a list of characters
        self.numVocabularyUsed = 0                      # proportion of vocabulary being used
        self.numWords = len(self.corpus.split())        # number of words in the corpus
        self.tokenizedOutput = []
        self.totalChars = 0


    # this method is used to find the next available index on the right of the x index, within the input text which is not marked as "deleted", in the set deletedIndices
    def findRightIndex(self, x):
        for i in range(x + 1, len(self.inputTxt)):
            if i not in self.deletedIndices:                # if index is not in the deleteIndices set, then it means that index is available
                return i
        return -1                                           # if no available index was found return  -1


    # this method is used to find the next available index on the left of the x index, within the input text which is not marked as "deleted", in the set deletedIndices     
    def findLeftIndex(self, x):
        for i in range(x - 1, -1, -1):
            if i not in self.deletedIndices:                # if the index is not in the deletedIndices set it means that it is available and can be returned
                return i
        return -1                                       # if no available index was found return  -1


    # this method loops through the entire input text to find every possible pair of adjacent characters, and saves each pair in the dictionary, as well as all the indexes for where that pair can be found in the corpus    
    def findAllPairs(self):
        for i in range(len(self.inputTxt) - 1):                 # loops through the training corpus
            pair = self.inputTxt[i] + self.inputTxt[i + 1]          # creates a pair of characters found at that index
            if pair in self.dictionary:
                self.dictionary[pair].add(i)                         # save the index of where the pair is found within the corpus
            else:
                self.dictionary[pair] = set()                   # save the pair in the dictionary and create a set as the value
                self.dictionary[pair].add(i)                    # save the index in the set


    # this method is responsible for applying all the merges that are in the vocabulary in the order they were learnt, and applying these merges to all the pairs in the input text
    def Tokenize(self):
        for x in self.vocabulary:               # loops through every merge/token in the vocabulary
            if x in self.dictionary:                # if the token/subword in the vocabulary is found in the dicitonary, it means it is in the corpus and can be merged into a single token
                self.numVocabularyUsed += 1         # increment the number of the tokens from the vocabulary that have been used or found in the corpus
                locations = self.dictionary[x]              # find all the locations where the subword is found and thus where the merge should be applied
                
                for location in locations.copy():               # loop through each location where the merge should be applied
                    rightPiece = self.findRightIndex(location)                          # find the next available index to the right of the current index
                    actualSubwordAtIndex = self.inputTxt[location] + self.inputTxt[rightPiece]          # save the actual subword at the index
                    if actualSubwordAtIndex == x and location not in self.deletedIndices:               # if the subword found at the index matches what we expect to find at the index, and the index is not marked as deleted in the deletedIndices set
                        leftStart = self.findLeftIndex(location)                                # find the next available index to the left of the current index
                        
                        
                        # this block of code is used to delete from the dictionary the old pair that is found on the left of the current merge which could have been formed but now will no longer be able to be formed since we are changing its adjacent pair by applying a merge to its adjacent pair
                        if leftStart != -1:
                            leftOldPair = self.inputTxt[leftStart] + self.inputTxt[location]           # this is the left pair that could have been formed at the left index if we were not applying our current merge
                            
                            if leftOldPair in self.dictionary:
                                if len(self.dictionary[leftOldPair]) == 1:                  # if this pair only has a frequency of 1...
                                    del self.dictionary[leftOldPair]                        # then we can simply delete it from our dicitonary, otherwise...
                                else:
                                    self.dictionary[leftOldPair].remove(leftStart)          # if it has a frequency greater then one, then we just remove the current index from the list of indexes of where it can be found, thereby reducing its frequency by 1


                        # this next block  of code is used to delete from the dictionary the old pair that is found on the right of the current merge, which could have been formed but now will no longer be able to be formed since we are changing its adjacent pair by applying a merge to its adjacent pair
                        rightStart2 = self.findRightIndex(rightPiece)               # find the next available right index
                        if rightStart2 != -1:                                               # if index is valid
                            rightOldPair = self.inputTxt[rightPiece] + self.inputTxt[rightStart2]                   # this is the right pair that could have been formed at the left index if we were not applying our current merge
                            
                            if rightOldPair in self.dictionary:
                                if len(self.dictionary[rightOldPair]) == 1:                 # if this pair only has a frequency of 1...
                                    del self.dictionary[rightOldPair]                       # then we can simply delete it from our dicitonary, otherwise...
                                else:
                                    self.dictionary[rightOldPair].remove(rightPiece)        # if it has a frequency greater then one, then we just remove the current index from the list of indexes of where it can be found, thereby reducing its frequency by 1

                        
                        # this block of code is used to update the available adjacent pairs which can be formed on the left, after we apply a merge next to it
                        if leftStart != -1:                                       # if the left index is valid
                            newLeftPair = self.inputTxt[leftStart] + x                  # the new pair which will be able to be formed on the left after we apply our merge
                            if newLeftPair in self.dictionary:
                                self.dictionary[newLeftPair].add(leftStart)         # add the index to the dictionary for where this pair can be found
                            else:
                                self.dictionary[newLeftPair] = set()                # add the pair to the dictionary
                                self.dictionary[newLeftPair].add(leftStart)             # add the index for where the pair can be found to the dictionary


                        # this block of code is used to update the available adjacent pairs which can be formed on the right of the current merge we are applying
                        if rightStart2 != -1:                       # if the right index is valid
                            newRightPair = x + self.inputTxt[self.findRightIndex(rightPiece)]           # the new pair which will be able to be formed on the right after we apply our merge
                            if newRightPair in self.dictionary:
                                self.dictionary[newRightPair].add(location)                 # add the index to the dictionary for where this pair can be found
                            else:
                                self.dictionary[newRightPair] = set()                       # add the pair to the dictionary
                                self.dictionary[newRightPair].add(location)                 # add the index for where the pair can be found to the dictionary


                        self.inputTxt[location] = x                                 # now we actually apply the merge by setting the first half of the pair equal to the whole new pair....
                        self.deletedIndices.add(rightPiece)                     # and then rather than actually deleting the other half of the pair on the right, we add its index to the deletedIndices set, to mark it deleted
                
                del self.dictionary[x]                              # now we remove the current pair that we just merged from the dictionary as we have completely merged it at all its occurances throughout the input text


    # method which goes through the whole input text after the tokenizing process and deletes all indices which were marked for deletion, by being put in the deletedIndices set
    def cleanTokenizedOutput(self):
        newList = []
        for i in range(len(self.inputTxt)):             # loops through the input text
            if i not in self.deletedIndices:                # if the index is not in the deletedIndices set then it can remain in the input text
                newList.append(self.inputTxt[i])
        self.inputTxt[:] = newList


    # this method is called to start the tokenizing process
    def run(self):
        start_time = time.time()

        self.findAllPairs()             # we find all the possible pairs that can be formed from the adjacent characters, and store them and their locations/indexes in the dictionary

        self.Tokenize()                 # we call the tokenize function to tokenize the corpus that was inputted

        self.cleanTokenizedOutput()        # we call the cleanTokenizedOutput method to clean the output, by removing all indices which were marked for deletion

        # Calculate results
        numberOfTokens = len(self.inputTxt)
        tokenToWordRatio = numberOfTokens / self.numWords
        vocabularyProportion = self.numVocabularyUsed / len(self.vocabulary)        # proportion of the vocabulary subwords that were present in the tokenized text
        totalChars = sum(len(s) for s in self.inputTxt)

        elapsed_time = time.time() - start_time
        
        # Store tokenized output
        self.tokenizedOutput = self.inputTxt
        self.totalChars = totalChars
        return {"analytics":{"tokens": numberOfTokens,"tokenWordRatio": tokenToWordRatio,"chars": totalChars,"timeTaken": elapsed_time, "proportionOfVocab": vocabularyProportion },"tokenizedText": self.tokenizedOutput}

