import json
from channels.generic.websocket import AsyncWebsocketConsumer

from django.apps import apps
# from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    # async def disconnect(self):
    #     pass
    # @database_sync_to_async
    @sync_to_async
    def nearbySearch(self, lat, lon, radius):
        Temp_Business = apps.get_model('Landing', 'Temp_Business')
        return Temp_Business.objects.search(lat, lon, radius)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data) #get sent json
        print(text_data_json)
        lat = text_data_json['lat']
        lon = text_data_json['lon']
        radius = text_data_json['radius']
        print("recieved lat: " + str(lat) + ' lon: ' + str(lon) + " radius: "+ str(radius))
        # qs = await database_sync_to_async(self.nearbySearch(lat, lon, radius))() #query dbs
        qs = await self.nearbySearch(lat, lon, radius)

        await self.send(text_data=json.dumps(qs))



