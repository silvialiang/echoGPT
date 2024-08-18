import json

#生成persona prompt所需部分
def generate_description(x,init_personality):
    try:
        title = x['title']
    except:
        title = ''
    try:
        tags = json.loads(x['json_metadata'])['tags']
    except:
        tags = ''
    try:
        body = x['body']
    except:
        body = ''
    init_personality = "you has a personality of" +str(init_personality)
    post = "Your new post is tagged with\n" + str(tags)+ ", in which content is\n"+str(body)+" \nand titled with "+ str(title)
    prompt_overall ="Summarize the personality concisely under 100 words based on the previous personality and your new post, with a fact_based answer,avoiding excessive optimism"
    return init_personality,post,prompt_overall

#memory reflection instruction
memory_generate_system_setting = "Based on the persona provided, please analyze the specified post to extract its core elements. Provide a detailed overview including the main points, a summary of the content, insights into the poster's expression, persona, any significant themes or messages, high-level reflections, and etc. Keep the analysis concise, limited to multiple 30 short sentences, to capture the essence of the following post efficiently from the poster's perspective in bullet points."
