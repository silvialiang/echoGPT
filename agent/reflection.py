
from api.api import Ai_completion
import time 

class Reflection:
    def __init__(self):
        self.api = Ai_completion()
    

    def generate_reflection(self, data):
        observation = []
        for p in data:
            persona = p['personality']
            post = p['body']
            title = p['title']
            observation.append(self.api.ai_reflection(persona,post,title))
            time.sleep(1)
        return observation
"""
#df:提取后处理数据库内拿出来的数据，需要处理的用户表格， 返回用户表格
def generate_memory_obeservations(df):
    df =  df.sort_values(by = 'created')
    obeservation = []
    for i in tqdm(df.iterrows()):
        persona = i[1]['completion']
        post = i[1]['body']
        title = i[1]['root_title']
        obeservation.append(response_generate(str(persona), str(post),str(title)).split('\n'))
    df['obeservation'] = obeservation
    return df


#改变reflective memory存储格式
#concat decay observation with the raw body text together
def concat_body_observation(df_observation,df_raw):
    df_raw = df_raw[['created','body']].rename(columns = {'created':'time','body':'obeservation'})
    #create a new column with sign = True
    df_observation['sign'] = False
    df_raw['sign'] = True
    new = pd.concat([df_observation,df_raw],axis = 0)
    new.sort_values(by = 'time',inplace = True)
    new.fillna(method = 'ffill',inplace = True)
    new.reset_index(drop = True,inplace = True)
    return new

def generate_process(df):
    df_sum = pd.DataFrame({'time':[],'obeservation':[],'persona':[]})
    for i in tqdm(df.iterrows()):
        time_lis =[]
        obeservation_lis = []
        persona_lis = []
        time = i[1]['created']
        obeservations= i[1]['obeservation']
        persona = i[1]['completion']
        for i in obeservations:
            time_lis.append(time)
            obeservation_lis.append(i.replace('- ',''))
            persona_lis.append(persona)
        new_df = pd.DataFrame({'time':time_lis,'obeservation':obeservation_lis,'persona':persona_lis})
        df_sum = pd.concat([df_sum,new_df]) 
    df_sum.dropna(inplace = True)
    a = []
    for q in df_sum.iterrows():
        if len(q[1]['obeservation'])<15:
            a.append(np.nan)
        else:
            a.append(q[1]['obeservation'])
    df_sum['obeservation_sign'] = a
    df_sum.dropna(inplace = True)
    df_sum = df_sum[['time','obeservation','persona']]
    df_whole = concat_body_observation(df_sum,df)
    
    #！！！df_whole保存到database，返回true,这就是后面用的df_observation
    return True




"""
