"""
import os
import pandas as pd
c = []
for i in os.listdir('/Users/silvia/Downloads/allposts/'):
    if '_des' not in i and i != '.DS_Store':
        print()
        r = pd.read_csv('/Users/silvia/Downloads/allposts/'+i)
        c.append(r.shape)
print(len(c))


from pymongo import MongoClient

# 连接到MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['echoGPT']
user_history = db['user_history']
# 认证（如果需要）
#db.authenticate('admin_username', 'admin_password')

# 获取用户信息
for document in user_history.find():
    print(document)
    break

data.forEach((d, index) => {let persona = personas[index] // Get the corresponding persona
                let card = this.createOneCard(d, persona)
                cardsText += card
            })

"""
from openai import OpenAI
client = OpenAI(api_key='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'
                ,timeout=20.0, max_retries=3)

response = client.chat.completions.create(
  model="gpt-4",
  messages=[
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is a LLM?"}
  ]
)
print(response)