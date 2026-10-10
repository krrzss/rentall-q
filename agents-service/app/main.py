import os
import json
import uvicorn
from app.config import settings
from app.api.routes import handle_agent_request


async def app(scope, receive, send):
    """Lightweight ASGI server application handling internal HTTP API calls."""
    if scope['type'] == 'http':
        path = scope['path']
        method = scope['method']
        
        # Read body
        body = b""
        more_body = True
        while more_body:
            message = await receive()
            body += message.get('body', b'')
            more_body = message.get('more_body', False)

        body_data = {}
        if body:
            try:
                body_data = json.loads(body.decode('utf-8'))
            except Exception:
                pass

        status_code, response_payload = handle_agent_request(path, method, body_data)
        
        response_body = json.dumps(response_payload).encode('utf-8')

        await send({
            'type': 'http.response.start',
            'status': status_code,
            'headers': [
                (b'content-type', b'application/json'),
                (b'content-length', str(len(response_body)).encode('utf-8')),
            ],
        })
        await send({
            'type': 'http.response.body',
            'body': response_body,
        })


if __name__ == "__main__":
    port = int(os.getenv("AGENTS_SERVICE_PORT", 8000))
    print(f"Starting {settings.PROJECT_NAME} on port {port}...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
