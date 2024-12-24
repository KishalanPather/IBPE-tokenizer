//DOM elements
//Text field tokenizing
const listOfTokenizers = document.querySelector("ul.tokenizer-option");
let tokenizerDeleteButtons;                                             //can only be instantiated once database call is done
const typedTextForm = document.querySelector('form.typed-text-form')
const textField = document.querySelector("textarea.input-field");
const tokenizeSubmitButton = document.querySelector("input.tokenize-submit");

//example button
const exampleButton = document.querySelector('.example-button');
const defaultTokenizerOption = document.querySelector('.default-tokenizer');

//analytics
const tokensDisplayed = document.querySelector('h3.tokens-displayed');
const charactersDisplayed = document.querySelector('h3.characters-displayed');
const tokenWordRatio = document.querySelector('h3.tokenWordRatio');
const proportionOfVocab = document.querySelector('h3.proportionOfVocab');
const timeTaken = document.querySelector('h3.timeTaken')
const tokenizedDisplayedText = document.querySelector('p.tokenized-displayed-text');

//training form
const inputTrainingFileButton = document.querySelector('button.input-training-file-button');
const inputTrainingForm = document.querySelector("form.input-training-file-form");
const cancelTrainingButton = document.querySelector("button.cancel-training-btn");

//tokenizing form
const inputTokenizingFileButton = document.querySelector('button.input-tokenizing-file-button');
const inputTokenizingForm = document.querySelector('form.input-tokenizing-file-form');
const cancelTokenizingButton = document.querySelector('button.cancel-tokenizing-btn');
const tokenizerListInForm = document.querySelector('ul.tokenizer-option-in-tokenize-form');
const fileDownloadPopup  = document.querySelector("div.tokenized-file-download");
const downloadTokenizedFileButton = document.querySelector('button.download-tokenized-file-button');


//Tokenizers stored locally from database
let tokenizers = [];


//retrieve tokenizer options
Fetch.getVocabularies(result => tokenizers = result) 
    .then(() => {                                        
        tokenizers.forEach(tokenizer => {               //display tokenizers in the UI
            
            if(tokenizer.tokenizerName == "Default Tokenizer"){             //prevents the default tokenizer from being deleted
                Utility.displayTokenizers(listOfTokenizers, tokenizer, false, true);
            } else{
                Utility.displayTokenizers(listOfTokenizers, tokenizer, false, false); 
            }  
        })
        
        //deleting tokenizers
        tokenizerDeleteButtons = document.querySelectorAll("button.tokenizer-delete");
        tokenizerDeleteButtons.forEach((button) => button.addEventListener("click", (e) => {        
            e.preventDefault();
            Fetch.deleteVocabulary(button.id);
            location.reload();
     }));
 })


//On submission of the text field
tokenizeSubmitButton.addEventListener("click", (e) => {
    e.preventDefault();

    //form validation
    const testTextBox = Utility.handleError(textField,"Please enter text in the text field.",typedTextForm);
    if (testTextBox){
        Utility.loadingScreen("on","Tokenizing...");
    } else{
        throw new Error("Form validation error.");
    }
    

    const checkedRadio = document.querySelector('input[name="tokenizer-option"]:checked');  //tokenizer option selected

    const tokenizer = tokenizers.find(item => item._id === checkedRadio.value);  //find tokenizer object using the ID from the radio menu
    const tokenizerData = {
        fileName:"textbox",             //it comes from the textbox so there's no file name
        tokenizer: tokenizer,
        text: textField.value.trim(),
        operation: "tokenize"
    }
    console.log("Tokenizer object being sent: ",tokenizerData);

    Fetch.sendDatatoPython(tokenizerData)                                //send tokenizer object to python
    .then(() => {
        Utility.loadingScreen("off");
        Fetch.receiveFromPython("tokenized-data",(result) => {           //get response from python
            console.log("Tokenized object received:",result);
            //update the DOM with analytics 
            Utility.updateElement(tokensDisplayed,result.analytics.tokens);
            Utility.updateElement(charactersDisplayed,result.analytics.chars);
            Utility.updateElement(tokenWordRatio,result.analytics.tokenWordRatio.toFixed(2));
            Utility.updateElement(proportionOfVocab,(result.analytics.proportionOfVocab*100).toFixed(2));
            Utility.updateElement(timeTaken,result.analytics.timeTaken.toFixed(2));
            Utility.highlightTokenizedText(result.tokenizedText,tokenizedDisplayedText);        //highlights tokens 
        });
    })

})

//example button
exampleButton.addEventListener('click',(e) => {
    e.preventDefault();
    textField.value = `Taylor Swift is telling me a story, and when Taylor Swift tells you a story, you listen, because you know it’s going to be good—not only because she’s had an extraordinary life, but because she’s an extraordinary storyteller. This one is about a time she got her heart broken, although not in the way you might expect.She was 17, she says, and she had booked the biggest opportunity of her life so far—a highly coveted slot opening for country superstar Kenny Chesney on tour. “This was going to change my career,” she remembers. “I was so excited.” But a couple weeks later, Swift arrived home to find her mother Andrea sitting on the front steps of their house. “She was weeping,” Swift says. “Her head was in her hands as if there had been a family emergency.” Through sobs, Andrea told her daughter that Chesney’s tour had been sponsored by a beer company. Taylor was too young to join. “I was devastated,” Swift says. `
    tokenizeSubmitButton.click()
})



//display training form
inputTrainingFileButton.addEventListener("click",() => {
    inputTrainingForm.style.display = "block";
    inputTokenizingForm.style.display = "none";     //if tokenizing form is displayed, hide it to display only the training form
})

//hide training form
cancelTrainingButton.addEventListener("click", (e) => {
    e.preventDefault();
    inputTrainingForm.style.display = "none";
})


//submitting training form
inputTrainingForm.addEventListener("submit",async (e) => {  //async bc we have to wait for the file to be read
    e.preventDefault();

    //form validation
    const testName = Utility.handleError(inputTrainingForm.tokenizer_name,"Please enter a tokenizer name.",inputTrainingForm);
    const testVocab =Utility.handleError(inputTrainingForm.vocabulary_size, "Please enter a vocabulary size.",inputTrainingForm);
    const testFile =Utility.handleError(inputTrainingForm.training_file_input.files[0], "Please select a file.",inputTrainingForm);
    const testDuplicateName = Utility.testDuplicateName(inputTrainingForm.tokenizer_name.value,tokenizers,inputTrainingForm)
    if(testName && testVocab && testFile && testDuplicateName){
        Utility.loadingScreen("on","Training");
    }else{
        throw new Error("Form validation error.");
    }
    const fileString = await Utility.convertFileToString(inputTrainingForm.training_file_input.files[0]);    //convert the contents of the file to a string

    trainingData ={
        tokenizerName:inputTrainingForm.tokenizer_name.value,
        VocabularySize: inputTrainingForm.vocabulary_size.value,
        text: fileString,
        operation: "train"
    }

    console.log("training data object:",trainingData);
    Fetch.sendDatatoPython(trainingData)     //send training object to python
    .then(() => {
        console.log("sent training data");
        Utility.loadingScreen("off");

        Fetch.receiveFromPython("trained-data",(result) => {     //get response from python
            console.log("Trained object received:", result);

            Fetch.addVocabulary(result)
            Utility.requestReload(inputTrainingForm,"Please refresh page to display new tokenizer.")
            
        }) 
    })
               
})


//display tokenizing form
inputTokenizingFileButton.addEventListener("click",() => {
    inputTokenizingForm.style.display = "block";
    inputTrainingForm.style.display = "none";   //if training form is displayed, hide it to display only the tokenizing form
    tokenizers.forEach(tokenizer => Utility.displayTokenizers(tokenizerListInForm, tokenizer, true));   //display tokenizers in form
})


//hide tokenizing form
cancelTokenizingButton.addEventListener("click", (e) => {
    e.preventDefault();
    inputTokenizingForm.style.display = "none";
    tokenizerListInForm.innerHTML = "";
})



//submitting tokenizing form
inputTokenizingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const testFileName= Utility.handleError(inputTokenizingForm.file_name,"Please enter a file name.",inputTokenizingForm)
    const testFile= Utility.handleError(inputTokenizingForm.tokenizing_file_input.files[0], "Please select a file.",inputTokenizingForm)
    
    if(testFileName && testFile){
        Utility.loadingScreen("on","Tokenizing");
    } else{
        throw new Error("Form validation error.");
    }


    const fileString = await Utility.convertFileToString(inputTokenizingForm.tokenizing_file_input.files[0]);        //convert the contents of the file to a string
    const checkedRadio = document.querySelector('input[name="tokenizer-option-in-tokenize-form"]:checked');
    const tokenizer = tokenizers.find(item => item._id === checkedRadio.value);  //find tokenizer object using the ID from the radio menu

    const tokenizingData = {
        fileName: inputTokenizingForm.file_name.value,
        tokenizer: tokenizer,
        text: fileString,
        operation: "tokenize"
    }

    console.log("tokenizing data object:",tokenizingData);
    Fetch.sendDatatoPython(tokenizingData)                           //send tokenizing object to python
    .then(() => {
        console.log("sent tokenizing data.");
        Utility.loadingScreen("off");
        Fetch.receiveFromPython("/tokenized-data",(result) => {
            console.log("Tokenized object received:", result);

            inputTokenizingForm.style.display = "none";                 //display download button
            fileDownloadPopup.style.display = "block";                  //and hide tokenizing form

            //update Ui
            Utility.updateElement(tokensDisplayed,result.analytics.tokens);
            Utility.updateElement(charactersDisplayed,result.analytics.chars);
            Utility.updateElement(tokenWordRatio,result.analytics.tokenWordRatio.toFixed(2));
            Utility.updateElement(proportionOfVocab,(result.analytics.proportionOfVocab*100).toFixed(2));
            Utility.updateElement(timeTaken,result.analytics.timeTaken.toFixed(2));
            //Utility.highlightTokenizedText(result.tokenizedText,tokenizedDisplayedText);

            //convert to .txt file and allow download
            downloadTokenizedFileButton.addEventListener('click', () => {

                Utility.downloadFile(result.tokenizedText.join('_'), tokenizingData.fileName);  //join to separate by underscores
                location.reload();
            })
        })
    })
})