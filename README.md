# AI Company Search
Have GPT search the internet for company metadata and details

### Web App

The UI should look like the GIF shown below:

![UI of AI Searcher](images/ai_searcher_vid.gif)

### Frontend

To install packages, run:
```
npm install axios
```

To run the web app locally, run the script below:
```
cd frontend
npm start
```

### Backend

First, replace the OpenAI API key with your own API key in the `docker-compose.yml` file. To run the instance, make sure your docker is up, then run:

```
docker-compose up --build -d
```

to expose the AI company searcher endpoint.
