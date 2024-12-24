class Fetch{
    static async getVocabularies(callback){                
        try{
            const response = await fetch("http://localhost:3000/all-vocabularies");
            const data = await response.json();
            callback(data);                 //do what you want to do by calling the callback function
            console.log("vocabularies retrieved!")
        } catch(err){
            console.log("Error retrieving vocabularies from database. Error ", err);
            alert("retrieval from database error occurred");
        }
    }

    static deleteVocabulary(id){
        const endpoint = `http://localhost:3000/vocabularies/${id}`;
        fetch(endpoint,{ method: 'DELETE'})
            .then(() => {})
            .catch(err => {console.log("Error: could not delete from the database. Error:", err)})
    }

    static addVocabulary(data){
        const endpoint = "http://localhost:3000/add-vocabulary";
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
        const endpoint = "http://127.0.0.1:5000/receiver"
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
        const endpoint = `http://127.0.0.1:5000/${url}`;
        try{
            const response = await fetch(endpoint);
            const data = await response.json();

            callback(data); //do what you want to do by calling the callback function

        }catch(err){
            console.log("Error with receiving data from python. Error: ",err);
        }
    }

}


