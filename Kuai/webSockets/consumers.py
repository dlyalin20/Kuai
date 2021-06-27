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
    def nearbySearch(self, lat, lon, nelat, nelon, swlat, swlon):
        Business = apps.get_model('Landing', 'Business')
        return Business.objects.search(lat, lon, nelat, nelon, swlat, swlon)
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
        return("recieved-waittime")
        # return 

    async def receive(self, text_data):#request to 
        text_data_json = json.loads(text_data) #get sent json
        print(text_data_json)
        keys = text_data_json.keys()
        if ("lat" in keys):
            lat = text_data_json['lat']
            lon = text_data_json['lon']
            nelat = text_data_json['nelat']
            nelon =text_data_json['nelon']
            swlat = text_data_json['swlat']
            swlon = text_data_json['swlon']
            if (lat and lon and nelat and nelon and swlat and swlon):
                # run nearby search
                print("recieved lat: " + str(lat) + ' lon: ' + str(lon) + " radius: ")
                print("nelat: " + str(nelat) + ' nelon: ' + str(nelon))
                print("swlat: " + str(swlat) + ' swlon: ' + str(swlon))
                # qs = await database_sync_to_async(self.nearbySearch(lat, lon, radius))() #query dbs
                qs = await self.nearbySearch(lat, lon, nelat, nelon, swlat, swlon)
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
                await self.send(text_data=qs)
            await self.send("bad input")

        
       



