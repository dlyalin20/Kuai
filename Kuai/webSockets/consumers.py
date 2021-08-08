import json
from channels.generic.websocket import AsyncWebsocketConsumer

from django.apps import apps
# from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
Business = apps.get_model('Landing', 'Business')
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        await self.accept()

    # async def disconnect(self):
    #     pass
    # @database_sync_to_async
    @sync_to_async
    def nearbySearch(self, lat, lon, nelat, nelon, swlat, swlon, heat):
        # Business = apps.get_model('Landing', 'Business')
        return Business.objects.search(lat, lon, nelat, nelon, swlat, swlon, heat)
    @sync_to_async
    def addToWait(self, waitTime, placeID, user):
        # Business = apps.get_model('Landing', 'Business')
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

    @sync_to_async
    def getSetData(self, bizData):
        # Business = apps.get_model('Landing', 'Business')
        #find wait time data for bizs and if biz doesnt exist then create it
        print(bizData['placeID'])
        if bizData['placeID']: #check if input is null or false
            targetQuery = Business.objects.filter(placeID=bizData['placeID'])
            if targetQuery.exists(): #Check if there is a biz with that PlaceID
                print('exists already')
                Biz = targetQuery.get()
                Biz.updateTime() #refresh the experation time for the cashed Business
                return Biz.getAverage()
            else: # other wise create new Business model
                print('creating Biz')
                Biz = Business(lat = bizData['location']['lat'], lon = bizData['location']['lng'], placeID = bizData['placeID'])
                Biz.save()

    async def receive(self, text_data):#request to
        text_data_json = json.loads(text_data) #get sent json
        print(text_data_json)
        keys = text_data_json.keys()
        if ("request" in keys):
            if "NearbySearch" == text_data_json['request']:
                lat = text_data_json['lat']
                lon = text_data_json['lon']
                nelat = text_data_json['nelat']
                nelon =text_data_json['nelon']
                swlat = text_data_json['swlat']
                swlon = text_data_json['swlon']
                heat = (text_data_json['heat'] == 't')
                if (lat and lon and nelat and nelon and swlat and swlon):
                    # run nearby search or heat- nearby search
                    print("recieved lat: " + str(lat) + ' lon: ' + str(lon) + " radius: ")
                    print("nelat: " + str(nelat) + ' nelon: ' + str(nelon))
                    print("swlat: " + str(swlat) + ' swlon: ' + str(swlon))
                    # qs = await database_sync_to_async(self.nearbySearch(lat, lon, radius))() #query dbs
                    qs = await self.nearbySearch(lat, lon, nelat, nelon, swlat, swlon, heat)
                    print('qs: ' + str(qs))
                    if (heat):
                        formatedresponse = {
                            "request" : "heatMapData",
                            "data" : qs,
                        }
                        await self.send(json.dumps(formatedresponse))
                    else:
                        await self.send(text_data=json.dumps(qs))
            elif "submitWaitTime" == text_data_json['request']:
                self.user = self.scope["user"]
                placeID = text_data_json['place_id']
                # run wait time query
                waitTime = text_data_json['OverallTime']
                if (waitTime and placeID and self.user):
                    print("recieved waitTime: " + str(waitTime) + " placeID: "+ str(placeID))
                    # add to db
                    qs = await self.addToWait(waitTime, placeID, self.user)
                    await self.send(text_data=qs)
                await self.send("bad input")
            elif "getSetData" == text_data_json['request']:
                #run getSetData
                data = text_data_json['data']
                response = []
                for i in data:
                    waitTime = await self.getSetData(i)
                    if waitTime:
                        response.append([i['placeID'], waitTime])
                if (len(response) > 0):
                    print(response)
                    formatedresponse = {
                        "request" : "updateWaitTimes",
                        "data" : response,
                    }
                    await self.send(text_data=json.dumps(formatedresponse))
