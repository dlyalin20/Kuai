import json
from channels.generic.websocket import AsyncWebsocketConsumer

from django.apps import apps
# from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        await self.accept()

    # async def disconnect(self):
    #     pass
    # @database_sync_to_async
    @sync_to_async
    def nearbySearch(self, lat, lon, radius):
        Temp_Business = apps.get_model('Landing', 'Temp_Business')
        return Temp_Business.objects.search(lat, lon, radius)
    @sync_to_async
    def addToWait(waittimeperperson, placeID):
        Temp_Business = apps.get_model('Landing', 'Temp_Business')
        # add wait time to Biz and return the wait data object
        Temp_Business.objects.addWaitTime(waittimeperperson, placeID)
        # link object to user profile
        pass
        # return 

    async def receive(self, text_data):
        text_data_json = json.loads(text_data) #get sent json
        print(text_data_json)
        keys = text_data_json.keys()
        if ("lat" in keys):
            lat = text_data_json['lat']
            lon = text_data_json['lon']
            radius = text_data_json['radius']
            if (lat and lon and radius):
                # run nearby search
                print("recieved lat: " + str(lat) + ' lon: ' + str(lon) + " radius: "+ str(radius))
                # qs = await database_sync_to_async(self.nearbySearch(lat, lon, radius))() #query dbs
                qs = await self.nearbySearch(lat, lon, radius)
                await self.send(text_data=json.dumps(qs))
        elif ("finalData" in keys and text_data_json['finalData']):
            self.user = self.scope["user"]
            placeID = text_data_json['placeID']
            # run wait time query
            waittimeperperson = text_data_json['waittimeperperson']
            placeID = text_data_json['placeID']
            if (waittimeperperson and placeID and self.user):
                print("recieved waittimeperperson: " + str(waittimeperperson) + " placeID: "+ str(placeID))
                # add to db
                qs = await self.addToWait(waittimeperperson, placeID, self.user)
                await self.send(text_data=json.dumps(qs))
            pass

        
       



