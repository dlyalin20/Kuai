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
        Business = apps.get_model('Landing', 'Business')
        return Business.objects.search(lat, lon, radius)
    @sync_to_async
    def addToWait(self, waitTime, placeID, user):
        Business = apps.get_model('Landing', 'Business')
        # add wait time to Biz and return the wait data object
        review = Business.objects.addWaitTime(waitTime, placeID, user)
        if (review):
        #     # link object to user profile
            print(user)
            myprofile = user.profile
            myprofile.last_time_update = review
            myprofile.save()
            
        else:
            return ("error")
        return("Data recieved and Stored")
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
            waitTime = text_data_json['OverallTime']
            placeID = text_data_json['placeID']
            if (waitTime and placeID and self.user):
                print("recieved waitTime: " + str(waitTime) + " placeID: "+ str(placeID))
                # add to db
                qs = await self.addToWait(waitTime, placeID, self.user)
                await self.send(text_data=json.dumps(qs))
            await self.send("bad input")

        
       



