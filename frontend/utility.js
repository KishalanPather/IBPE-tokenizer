class Utility{
    static displayTokenizers(list,item,inTokenizeForm,defaultTokenizer){        //updates the UI
        let listitem;

        if(defaultTokenizer == true){           //we don't want the default tokenizer to be deleted
            listitem = `                            
                <label>
                    <input type ="radio" name ="tokenizer-option" value="${item._id}" checked>
                    <li>
                    ${item.tokenizerName}
                    </li>
                </label> `
        } else{
            if(inTokenizeForm === false){               //if its not in the tokenizer form, its in the text field form. We want the user to be able to delete here.
                listitem = `                            
                    <label>
                        <input type ="radio" name ="tokenizer-option" value="${item._id}">
                        <li>
                        ${item.tokenizerName}
                        <button class ="tokenizer-delete" id="${item._id}">X</button>
                        </li>
                    </label> `
            }else{                                  //don't want the user to delete here
                listitem = `
                    <li>
                    <input type ="radio" name ="tokenizer-option-in-tokenize-form" value="${item._id}">${item.tokenizerName}
                    </li>`
            }

        }

        
        list.innerHTML += listitem;
    }

    static updateElement(element,value){
        element.innerHTML = value;
    }

    static loadingScreen(status,operation = null){      //display this while training or tokenizing happens
        if(status == "on"){
            const overlay = document.createElement("div");
            overlay.setAttribute("class","overlay");
            document.body.appendChild(overlay);

           const loadingScreen = document.createElement("div");
            loadingScreen.setAttribute("class","loading-screen");
            loadingScreen.innerHTML = `<h1>${operation}...</h1>`
            document.body.appendChild(loadingScreen);
        }
        else if(status == "off") {
           try{
            const overlay = document.querySelector(".overlay");
            const loadingScreen = document.querySelector(".loading-screen");
            
            overlay.remove();
            loadingScreen.remove();
           }catch{
            console.log("no overlay or loadingscreen found. Assuming this is a preemptive call.")
           }
        }
        
    }

    static highlightTokenizedText(arrayOfTokens,output){        
        const colours = [
            "rgba(128, 0, 128, 0.3)",   // purple 
            "rgba(0, 128, 0, 0.3)",     // green 
            "rgba(255, 255, 0, 0.3)",   // yellow
            "rgba(255, 0, 0, 0.3)",     // red 
            "rgba(0, 0, 255, 0.3)"      // blue
        ];
        const outputDiv = output;
        outputDiv.innerHTML = "";

        arrayOfTokens.forEach((word, index) => {
            const span = document.createElement("span");
            span.textContent = word + " ";
            span.style.backgroundColor = colours[index % colours.length]; // Cycle through background colours
            //span.style.padding = "5px"; //padding for readability
            outputDiv.appendChild(span);
        });
    }

    static handleError(element,message, addToElement = body){       //for form validation
        if( element == undefined || element.value == ''){
            const errorMsg = document.createElement("div");
            errorMsg.setAttribute("class", "error-message");
            errorMsg.innerHTML = `<p>${message}</p>`;
            addToElement.appendChild(errorMsg);
            setTimeout(() => errorMsg.remove(),10000);
            return false;
        } else {
            return true;
        }
    }
    
    static testDuplicateName(input,array,output){       //form validation
        let found = false;

        array.forEach(item => {
            if(item.tokenizerName == input){
                found = true;
                console.log("same name detected");
            }
        })
        if(found){
            this.handleError(undefined,"A tokenizer with the same name exists already.",output);
            return false;
        }
        else{
            return true;
        }
    }


    static convertFileToString(file){       //using a promise so that we ensure operations happen only after the file has been read
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
    
            reader.onload = function() {resolve(reader.result)};
    
            reader.onerror = function() {
                reject(new Error("Error reading file"));
            };
    
            reader.readAsText(file);
        });

    }

    static requestReload(element, text){                    //tells the user to reload the page after training a tokenizer
        const message = document.createElement("p");
        message.innerHTML = text;
        element.appendChild(message);
    }

    static downloadFile(text, fileName){
        const blob = new Blob([text], {type: "text/plain"});
        const link = document.createElement("a");
        
        // Create a temporary link to initiate download
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.txt`;

        // Append the link to the document and click it
        document.body.appendChild(link);
        link.click();

        // Remove the link after downloading
        document.body.removeChild(link);

    }
}