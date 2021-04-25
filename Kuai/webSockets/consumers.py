import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    # async def disconnect(self):
    #     pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        print("recieved" + message)
        await self.send(text_data=json.dumps({
            'message': message
        }))
        print("recieved: " + message)