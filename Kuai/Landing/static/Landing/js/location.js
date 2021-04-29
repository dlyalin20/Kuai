class Location{

    constructor(placeID, lat=null, lng=null){
        this.placeID = placeID;
        if (lat && lng){
            this.lat = lat;
            this.lng = lng;
        }
    }

    showMarker(){
        
    }

}