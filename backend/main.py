import os
from pydantic import BaseModel

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain.agents import ConversationalChatAgent, AgentExecutor
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.tools import DuckDuckGoSearchRun



app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Be specific in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory = ConversationBufferMemory(
    return_messages=True,
    memory_key="chat_history", 
    output_key="output"
)

class CompanyName(BaseModel):
    company_name: str

openai_api_key = os.environ["OPENAI_API_KEY"]

info_types = [
    "General Information",
    "Main Products/Services",
    "Biggest Competitors",
    "Target Market",
    "Social Media Profiles",
]

@app.post("/search_company/")
async def search_company(body: CompanyName):
    company_name = body.company_name
    results = {}
    for info_type in info_types:
        response = fetch_info(company_name, info_type)
        if response:
            results[info_type] = response
        else:
            results[info_type] = "We couldn't find anything."
    return results

def fetch_info(company_name, info_type):
    prompts = {
        "General Information": f"Tell me general information about {company_name}.",
        "Main Products/Services": f"What are the main products or services offered by {company_name}?",
        "Biggest Competitors": f"Who are the biggest competitors of {company_name}?",
        "Target Market": f"Who is the target market of {company_name}?",
        "Social Media Profiles": f"Provide links to {company_name}'s social media profiles."
    }
    
    # Set up langChain & ChatGPT
    llm = ChatOpenAI(model_name="gpt-3.5-turbo", openai_api_key=openai_api_key, streaming=True)
    tools = [DuckDuckGoSearchRun(name="Search")]
    chat_agent = ConversationalChatAgent.from_llm_and_tools(llm=llm, tools=tools)
    executor = AgentExecutor.from_agent_and_tools(
        agent=chat_agent,
        memory=memory,
        tools=tools,
        return_intermediate_steps=True,
        handle_parsing_errors=True,
    )
    
    # Get Response
    response = executor(prompts[info_type], callbacks=[])
    if response:
        return response["output"]
    return None
