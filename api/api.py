
from openai import OpenAI
from agent.prompt_template import memory_generate_system_setting

class Ai_completion:
    
	def __init__(self):
		self.api_key = 'sk-proj-MzuVIchHnETRC9GOR55wT3BlbkFJ7kepYAjsGCvMiE0ZKD7a'
		self.client = OpenAI(api_key = self.api_key)
        # persona generation input: <string, user name>, 整理完成写入数据库，返回True
        #调用了openai api
	
	def ai_response_persona(self,init_personality,post,prompt_overall):
		completion = self.client.chat.completions.create(
            model="gpt-3.5-turbo-1106",
            temperature = 0.7,
            messages=[
                {"role": "system", "content": "always use the first person singular！please summarize a persona for an steemit user from the following information provided"},
                {"role": "user", "content": init_personality},
                {"role": "user", "content": post},
                {"role": "user", "content": prompt_overall},
                {"role":'user','content':'state the persona with the first person singular'}
                ]
            )
		return completion.choices[0].message.content
    
	def ai_reflection(self,persona,post,title):
		memory_generate_instruction = "Persona:\n" + persona +"\n Post:\n" + post+ "\n Title:\n" + title
		#pass that to the model
		completion = self.client.chat.completions.create(
			model="gpt-3.5-turbo-1106",
			temperature = 0.7,
			messages=[
			{"role": "system", "content": memory_generate_system_setting},
			{"role": "user", "content": memory_generate_instruction}
			]
			)
		return completion.choices[0].message.content

