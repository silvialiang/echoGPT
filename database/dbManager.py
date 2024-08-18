from pymongo import MongoClient

class DatabaseManager:
    def __init__(self):
        self.client = MongoClient("mongodb://127.0.0.1:27017/")
        self.db = self.client['echoGPT']
        self.user_history = self.db['user_history']
        self.user_history.delete_many({})
        self.user_history.create_index([('body', 1)], unique=True)
    
    def get_collection(self):
        return self.user_history

    


    

