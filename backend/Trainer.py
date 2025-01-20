import heapq

class Trainer:              # class which is responsible for training tokenizers and creating their vocabularies
    
    # constructor for the Trainer class
    def __init__(self, name, vocabSize, corpus, threshold=2,filterNewlineChars = False):
        self.name = name
        self.vocabSize = vocabSize
        self.corpus = corpus                # this is the training corpus
        self.threshold = threshold          # this threshold is used to set the minimum frequency that a pair must occur in the training corpus for it to be considered for merging
        self.dictionary = {}                # this dictionary will be used to store all the possible pairs of adjacent characters within the training corpus as well as the locations in the corpus where each pair can be found
        self.characters = []                
        self.priority_queue = []            # priority queue used to return the most frequent pair of characters that should be merged
        self.vocabulary = []                # this is the vocabulary that is built up during the training process
        self.deletedIndices = set()         # this set is used to keep track of all the indexes which have been "deleted" from the corpus
        self.filterNewlineChars = filterNewlineChars         # allows user to decide if they want to filter out newline characters from the training corpus or leave them in, this is a boolean, true or false


    # this method is used to convert any input string into a list of individual characters, which will be used in later processing
    def convertToCharacterArray(self, string):
        l = []
        
        if self.filterNewlineChars == True:
            for char in string:                                                  # loops through every character in the training corpus
                if char not in self.vocabulary:                                  # if a new unique character is found then it is added to the vocabulary
                    self.vocabulary.append(char)
                if char != "\n":                                                 # if a character is a newline character we skip it
                    l.append(char)                                               # place character in the output array
        else:
            for char in string:                                                  # loops through every character in the training corpus
                if char not in self.vocabulary:                                  # if a new unique character is found then it is added to the vocabulary
                    self.vocabulary.append(char)
                l.append(char)                                                   # place character in the output array
                
        return l
    
    
    # this method loops through the entire training corpus to find every possible pair of adjacent characters, and saves each pair in the dictionary, as well as all the indexes for where that pair can be found in the corpus     
    def findAllPairs(self):
        for i in range(len(self.characters) - 1):         # loops through the training corpus
            pair = self.characters[i] + self.characters[i + 1]          # creates a pair of characters found at that index
            if pair in self.dictionary:                             
                self.dictionary[pair].add(i)               # save the index of where the pair is found within the corpus
            else:
                self.dictionary[pair] = set()               # save the pair in the dictionary and create a set as the value
                self.dictionary[pair].add(i)                # save the index in the set


    # this method is used to find the next available index on the right of the x index, within the corpus which is not marked as "deleted", in the set deletedIndices
    def findRightIndex(self, x):
        for i in range(x + 1, len(self.characters)):
            if i not in self.deletedIndices:                # if index is not in the deleteIndices set, then it means that index is available
                return i                                    
        return -1                                       # if no available index was found return  -1
            
            
    # this method is used to find the next available index on the left of the x index, within the corpus which is not marked as "deleted", in the set deletedIndices     
    def findLeftIndex(self, x):
        for i in range(x - 1, -1, -1):
            if i not in self.deletedIndices:        # if the index is not in the deletedIndices set it means that it is available and can be returned
                return i
        return -1                                   # if no available index was found return  -1


    # converts the dictionary that contains all the possible adjacent pairs in the training corpus into a priority queue that is sorted by pairs with the highest frequency
    def dictToPriorityQueue(self):
        for pair, locations in self.dictionary.items():         
            if len(locations) >= self.threshold:                # if the frequency of the pair is greater than the threshold...
                heapq.heappush(self.priority_queue, (-len(locations), pair))            # then the pair and its frequency can be put on the priority queue as a tuple, in the format (frequency, pair)


    # this method merges two adjacent characters/strings in the training corpus at every index where they are found
    def merger(self, currentMergingPair):
        locations = self.dictionary[currentMergingPair]         # first we get an array of all the indexes where the current pair we are merging is found, within the training corpus
        self.vocabulary.append(currentMergingPair)              # then we add the current string that we are merging to our vocabulary

        for location in locations.copy():                       # loop through all the indexes where the pair/string is found
            rightPiece = self.findRightIndex(location)          # find the next available index to the right of the current index
            possiblePair = self.characters[location] + self.characters[rightPiece]          # store the pair at the current index in the possible pair variable
            
            if possiblePair == currentMergingPair and location not in self.deletedIndices:             # we can proceed further if the possible pair at the index, when merged is the same as the pair we expect to find at this current index, and if the current index has not been marked for deletion
                leftStart = self.findLeftIndex(location)                                        # find the next available index to the left of the current index
                
                
                # this piece of code is used to delete from the dictionary the old pair that is found on the left of the current merge which could have been formed but now will no longer be able to be formed since we are changing its adjacent pair by applying a merge to its adjacent pair
                if leftStart != -1:                                                             # if the left index is valid
                    leftOldPair = self.characters[leftStart] + self.characters[location]        # this is the left pair that could have been formed at the left index if we were not applying our current merge
                    
                    if leftOldPair in self.dictionary:                                          
                        if len(self.dictionary[leftOldPair]) == 1:                  # if this pair only has a frequency of 1...
                            del self.dictionary[leftOldPair]                        # then we can simply delete it from our dicitonary, otherwise...
                        else:
                            self.dictionary[leftOldPair].remove(leftStart)          # if it has a frequency greater then one, then we just remove the current index from the list of indexes of where it can be found, thereby reducing its frequency by 1
                            if len(self.dictionary[leftOldPair]) >= self.threshold:                                         # if after adjusting its frequency it still has a frequency greater than the threshold...
                                heapq.heappush(self.priority_queue, (-len(self.dictionary[leftOldPair]), leftOldPair))              # we push this pair back on to the heap


                # this next block  of code is used to delete from the dictionary the old pair that is found on the right of the current merge, which could have been formed but now will no longer be able to be formed since we are changing its adjacent pair by applying a merge to its adjacent pair
                rightStart = rightPiece
                rightStart2 = self.findRightIndex(rightStart)               # find the next available right index
                if rightStart2 != -1:                                           # if index is valid
                    rightOldPair = self.characters[rightStart] + self.characters[rightStart2]           # this is the right pair that could have been formed at the left index if we were not applying our current merge
                    if rightOldPair in self.dictionary:
                        if len(self.dictionary[rightOldPair]) == 1:              # if this pair only has a frequency of 1...
                            del self.dictionary[rightOldPair]                   # then we can simply delete it from our dicitonary, otherwise...
                        else:
                            self.dictionary[rightOldPair].remove(rightStart)                # if it has a frequency greater then one, then we just remove the current index from the list of indexes of where it can be found, thereby reducing its frequency by 1
                            if len(self.dictionary[rightOldPair]) >= self.threshold:                                        # if after adjusting its frequency it still has a frequency greater than the threshold...
                                heapq.heappush(self.priority_queue, (-len(self.dictionary[rightOldPair]), rightOldPair))        # we push this pair back on to the heap


                # this block of code is used to update the available adjacent pairs which can be formed on the left, after we apply a merge next to it
                if leftStart != -1:                                                         # if the left index is valid
                    newLeftPair = self.characters[leftStart] + currentMergingPair                   # the new pair which will be able to be formed on the left after we apply our merge
                    if newLeftPair in self.dictionary:              
                        self.dictionary[newLeftPair].add(leftStart)                                 # add the index to the dictionary for where this pair can be found
                        if len(self.dictionary[newLeftPair]) >= self.threshold:                     
                            heapq.heappush(self.priority_queue, (-len(self.dictionary[newLeftPair]), newLeftPair))      # put this new pair on the priority queue if it has a frequency >= threshold
                    else:
                        self.dictionary[newLeftPair] = set()                                        # add the pair to the dictionary
                        self.dictionary[newLeftPair].add(leftStart)                                 # add the index for where the pair can be found to the dictionary
                        if self.threshold < 2:
                            heapq.heappush(self.priority_queue, (-len(self.dictionary[newLeftPair]), newLeftPair))         # put the pair on the priority queue


                # this block of code is used to update the available adjacent pairs which can be formed on the right of the current merge we are applying
                if rightStart2 != -1:                                         # if the right index is valid
                    newRightPair = currentMergingPair + self.characters[self.findRightIndex(rightStart)]    # the new pair which will be able to be formed on the right after we apply our merge
                    if newRightPair in self.dictionary:
                        self.dictionary[newRightPair].add(location)                                 # add the index to the dictionary for where this pair can be found
                        if len(self.dictionary[newRightPair]) >= self.threshold:
                            heapq.heappush(self.priority_queue, (-len(self.dictionary[newRightPair]), newRightPair))        # put this new pair on the priority queue if it has a frequency >= threshold
                    else:
                        self.dictionary[newRightPair] = set()                                       # add the pair to the dictionary
                        self.dictionary[newRightPair].add(location)                                 # add the index for where the pair can be found to the dictionary
                        if self.threshold < 2:
                            heapq.heappush(self.priority_queue, (-len(self.dictionary[newRightPair]), newRightPair))           # put the pair on the priority queue


                self.characters[location] = currentMergingPair              # now we actually apply the merge by setting the first half of the pair equal to the whole new pair....
                self.deletedIndices.add(rightStart)                         # and then rather than actually deleting the other half of the pair on the right, we add its index to the deletedIndices set, to mark it deleted

        del self.dictionary[currentMergingPair]                             # now we remove the current pair that we just merged from the dictionary as we have completely merged it at all its occurances throughout the training corpus


    # this method is called to start the training process
    def Run(self):
        self.characters = self.convertToCharacterArray(self.corpus)         # we convert the corpus to an array of characters
        lengthOfCorpus = len(self.corpus.split())
        print(lengthOfCorpus)
        self.findAllPairs()                                     # we find all the possible pairs that can be formed from the adjacent characters, and store them and their locations/indexes in the dictionary
        self.dictToPriorityQueue()                                          # we take all the pairs found on the dictionary and put them on the priority queue

        counter = 0
        checkpoint = 300                                  # we establish a checkpoint so after a certain number of merges we rebuild the  priority queue, so that it does not contain as much stale data (which is basically pairs which are outdated and have since been changed)   
        thirdQuarter = self.vocabSize /3
        
        while len(self.vocabulary) < self.vocabSize and self.priority_queue:        # while the vocabulary has not been filled, and the priority queue is not empty
            counter += 1
            freq, pair = heapq.heappop(self.priority_queue)                             # pop the most frequent pair from the priority queue
            while pair not in self.dictionary or len(self.dictionary[pair]) != -freq:       # if the pair is not anymore in the dictionary, and it is stale data, meaning it has changed since being put on the queue
                if not self.priority_queue:                                                 # if the priority queue is empty, we break
                    break
                freq, pair = heapq.heappop(self.priority_queue)                         # pop the most frequent pair from the priority queue

            if pair in self.dictionary and len(self.dictionary[pair]) == -freq:         # if the pair is not anymore in the dictionary, and it is stale data, meaning it has changed since being put on the queue
                self.merger(pair)                                                       # we call the merge function to merge the most frequent pair at all its occurances
                if lengthOfCorpus > 500_000:
                    if len(self.vocabulary) < thirdQuarter:                                            
                        if counter >= checkpoint:                                           # if we reached our checkpoint
                            self.priority_queue = []                                        # create a new priority queue
                            self.dictToPriorityQueue()                                      # repopulate the priority queue with all pairs
                            counter = 0
        
        return {"vocabulary": self.vocabulary,"tokenizerName": self.name}               # return the trained vocabulary when done
    
