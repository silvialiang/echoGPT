import os
import csv
from agent.persona import Persona_generation
import pandas as pd
from database.dbManager import DatabaseManager
import csv
from agent.reflection import Reflection

class CSVReader:
    def __init__(self):
        self.directory = './user/allposts/'
        self.data = {}
        self.database = DatabaseManager()


    def read_csv_files(self):
        for filename in os.listdir(self.directory):
            if filename.endswith('.csv'):
                filepath = os.path.join(self.directory, filename)
                is_title = True
                with open(filepath, mode='r', encoding='utf-8-sig') as file:
                    reader = csv.DictReader(file)
                    self.data[filename[:-4]] = filename
                    data_list = list(reader) 
                    if len(data_list) != 0:
                        try:
                            self.database.user_history.insert_many(data_list)
                        except:    
                            print('error:'+filename)

    def get_users(self, query):
        users = list(self.data.keys())
        res = []
        for user in users:
            if query in user:
                res.append({
                    'name': user,
                    'code': user
                    })
        return res

    def get_data(self, user_id):
        sign = self.database.user_history.find_one({"author":user_id})
        if sign:
            #在这里处理用户persona，并显示到前端？是否存储，自己加个存储模块
            persona = Persona_generation()
            reflection = Reflection()
            persona_list = persona.generate_persona(list(self.database.user_history.find({"author": user_id},{'_id': 0}).sort('created',1)))
            print('-------persona generated complete----'+ str(len(persona_list)))
            documents = self.database.user_history.find({"author": user_id}).sort('created',1)  # 1 为升序
            n = 0
            for doc in documents:
                self.database.user_history.update_one({'_id': doc['_id']}, {'$set': {'personality': persona_list[n]}})
                n = n + 1
            reflection_list = reflection.generate_reflection(list(self.database.user_history.find({"author": user_id},{'_id': 0}).sort('created',1)))
            print('-------reflection generated complete----'+ str(reflection_list[0]))
            documents = self.database.user_history.find({"author": user_id}).sort('created',1)  
            n = 0
            for doc in documents:
                self.database.user_history.update_one({'_id': doc['_id']}, {'$set': {'reflection': reflection_list[n]}})
                n = n + 1
            #print(persona_list[0])
            #persona_list = []
            #处理用户reflected memory，并存储
            """results = list(self.database.user_history.find({"author": "Jack"}))
            for result in results:
                result['_id'] = str(result['_id'])
            """
            #print(list(self.database.user_history.find({"author": user_id},{'_id': 0}).sort('created',1))[0])
            return list(self.database.user_history.find({"author": user_id},{'_id': 0}).sort('created',1))#,persona_list
        else:
            return []
