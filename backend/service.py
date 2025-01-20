from flask import Flask, request, jsonify
from flask_cors import CORS


from Trainer import Trainer
from BPETokenizer import BPETokenizer

app = Flask(__name__)
cors = CORS(app)

#global as they are called in both functions
trainedObject = {}
tokenizedObject = {}

#receive training data or data to tokenize
@app.route('/receiver', methods=['POST']) 
def receive_data():
    data = request.json
    global trainedObject
    global tokenizedObject

    if (data["operation"] == "tokenize"):
        tokenizer = BPETokenizer(data["text"],data["tokenizer"]["vocabulary"])      #send data to tokenizer
        tokenizedObject = tokenizer.run()

    elif (data["operation"] == "train"):
        trainer = Trainer(data["tokenizerName"],int(data["VocabularySize"]),data["text"])       #send data to trainer
        trainedObject =  trainer.Run()

    return jsonify({'status':'success','received': 'data'})

#send trained or tokenized data
@app.route('/<string:data_type>', methods=['GET'])
def send_data(data_type):
    if data_type == "trained-data":
        print("Sending trained data...")
        return jsonify(trainedObject)

    elif data_type == "tokenized-data":
        print("Sending tokenized data...")
        return jsonify(tokenizedObject)

    return jsonify({'status': 'failure', 'message': 'Invalid data type'}), 400


if __name__ == '__main__':  
    app.run(host="0.0.0.0", port=5000)

