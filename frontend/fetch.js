class Fetch{
    static async getVocabularies(callback){    
        const url = "https://ibpe-tokenizer-node-backend.onrender.com";            
        try{
            const response = await fetch(`${url}/all-vocabularies`);
            const data = await response.json();
            callback(data);                 //do what you want to do by calling the callback function
            console.log("vocabularies retrieved!")
        } catch(err){
            console.log("Error retrieving vocabularies from database. Error ", err);
            alert("retrieval from database error occurred");
        }
    }

    static deleteVocabulary(id){
        const url = "https://ibpe-tokenizer-node-backend.onrender.com";
        const endpoint = `${url}/${id}`;
        fetch(endpoint,{ method: 'DELETE'})
            .then(() => {})
            .catch(err => {console.log("Error: could not delete from the database. Error:", err)})
    }

    static addVocabulary(data){
        const url = "https://ibpe-tokenizer-node-backend.onrender.com";
        const endpoint = `${url}/add-vocabulary`;
        fetch(endpoint,{
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)})
            .then(res => {
                if(res.ok){
                    return res.json();
                }else{
                    alert("Could not add to vocabulary: ",err);
                }
            });
    }

    static async sendDatatoPython(data){    //async just so receiveDataFromPython() only runs once this has finished running.
        const url = "https://ibpe-tokenizer-flask-backend.onrender.com";
        const endpoint = `${url}/receiver`;
        const response = await fetch(endpoint,{
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)})
            .then(res => {
                if(res.ok){
                    return res.json();
                }else{
                    alert("Could not send data to python: ", err);
                }
            })
            .then(jsonResponse => console.log("Sucessfully sent data to python. Response status: ",jsonResponse))    // Log the response data in the console
            .catch((err) => console.error("Error with sending data to python. Error: ",err));
            return response; //nothing important in the response. Just here so the async function can work

    }

    static async receiveFromPython(url, callback){
        const link = "https://ibpe-tokenizer-flask-backend.onrender.com"
        const endpoint = `${link}/${url}`;
        try{
            const response = await fetch(endpoint);
            const data = await response.json();

            callback(data); //do what you want to do by calling the callback function

        }catch(err){
            console.log("Error with receiving data from python. Error: ",err);
        }
    }

}


