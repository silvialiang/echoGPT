from openai import OpenAI
#from config import api_key
import json
import os
import time
from collections import Counter
from agent.prompt_template import generate_description
from api.api import Ai_completion
#from database.dbManager import DatabaseManagerget_collection

class Persona_generation:

    def __init__(self):
        self.api = Ai_completion()
        # persona generation input: <string, user name>, 整理完成写入数据库，返回True
        #调用了openai api

    def generate_persona(self, data):
        init_personality = ''
        completion_list = []
        for p in data:
            init_personality,post,prompt_overall = generate_description(p,init_personality)
            init_personality = self.api.ai_response_persona(init_personality,post,prompt_overall)
            completion_list.append(init_personality)
            time.sleep(2)
        #!!completion_list写入mongodb
        return completion_list