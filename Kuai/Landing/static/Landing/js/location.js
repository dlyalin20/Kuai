class hashtable {
    constructor() {
        this.list = [];
    }
    async doesExistorAdd(placeID, array_index) {
        var x = await getHash(placeID);
        var dv = new DataView(x);
        var hash = dv.getInt32();
        if (this.list[hash]) {
            return true;
        } else {
            this.list[hash] = parseInt(array_index)  + 1;// plus one to avoid the number coming back from the hash as false
            return false;
        }
    }
    /**
     * Get the index in the array of a found PlaceID
     * @param {String} placeID 
     * @return {Int}
     * @return {null}
     */
    async getIndex(placeID){
        var x = await getHash(placeID);
        var dv = new DataView(x);
        var hash = dv.getInt32();
        return this.list[hash] - 1 
    }
}
var bizHash = new hashtable();
var targetBiz;

class Business {
    // location new google.maps.LatLng(location);
    //Call back is run after contructor is done
    constructor(placeID,array_index, location = null, name = null, callback = null, waitTime = null) {
        if (waitTime != null){ 
            this.waitTime = Math.round(waitTime); // round wait time to a whole number
        }
        this.placeID = placeID;
        this.infowindow = new google.maps.InfoWindow;
        this.callback = callback;
        this.array_index = array_index; 
        if (!(location && name)) {
            //if we dont have location or name run Places Details request to get lat lng and name
            const hold = this;
            this.pendinginfo = new Promise(function(accept, r){
                queryService(placeID, function (results) {
                    // fill in rest of info
                    let pos = results.geometry.location
                    hold.position = pos;
                    hold.name = results.name;
                    const icon = {
                        url: results.icon,
                        size: new google.maps.Size(71, 71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25),
                      };
                    hold.marker = new google.maps.Marker({
                        icon,
                        position: hold.position
                    });
                    hold.callback();
                    accept();
                    
                });
            })
            
        } else {
            // we have all the infomation just plug it in
            this.name = name;
            this.position = location;
            this.marker = new google.maps.Marker({
                position: this.position
            });
            // setmarkerCallBack(self);
            if (callback) {
                this.callback();
        }    
    }     
    }

    async getName(){
        await this.pendinginfo;
        return this.name;        
    }
    async showMarker() {
        if (!(this.position && this.marker)) {
            this.marker = new google.maps.Marker({
                position: await this.position
            });
            setmarkerCallBack(self);
        }
        this.marker.setMap(map);
    }
    addHash() {
        bizHash.doesExistorAdd(this.placeID, this.array_index);
    }

    async testHash() {
        //if place_id hash already exists returns true
        //else returns false
        return await bizHash.doesExistorAdd(this.placeID, this.array_index);
    }
    hideMarker() {
        if (this.marker) {
            this.marker.setMap(null);
        }
    }

    async pushDivDescription() { // what happends when u click on the marker
        var i = this.array_index + 1;
        if (!(this.position && this.marker)) {
            await this.position;
            this.marker = new google.maps.Marker({
                position: this.position
            });
        }
        this.showMarker();
        let baseObject = `<div class='option-items'>` + i + '. ' + this.name + `<hr></div>`;
        console.log(baseObject);
        const parent = this;
        let myDiv = $(baseObject)
            .on("click", function () {
                parent.ToggleThisPopUp();
            })
            .css("order", i)
            .appendTo(choices)
        // console.log(myDiv);
        // choices.append(myDiv);


    }
    /**
     * Center map on the Business marker
     */
    goTo(){
        map.panTo(this.position)
        map.setZoom(18);
    }
    ToggleThisPopUp() {
        if (targetBiz != null && targetBiz.placeID == this.placeID) {
            closePopUp();
            targetBiz = null;
        } else {
            load_route_to_biz(this);
            targetBiz = this;
            this.goTo();
            if (this.waitTime) {
                openPopUp(this.name, this.placeID, this.waitTime);
            }
            else {
                openPopUp(this.name, this.placeID);
            }
        }

    }
}

// Run SHA-256 on data
async function getHash(string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(string);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return hash;
}

async function settleCoords(lat, lng) {
    let templat = await lat();
    let templng = await lng();
    return new google.maps.LatLng(templat, templng)
}

// set marker callback
function setmarkerCallBack(thisObj) {
    google.maps.event.addListener(thisObj.marker, "click", () => {
        thisObj.ToggleThisPopUp();
    });
}

function queryService(targetID, callback, index = false) {
    if (targetID) { //!= ""
        const request = {
            placeId: targetID,
            fields: ["name", "formatted_address", "place_id", "geometry", "icon", "photo"],
        };
        service.getDetails(request, (place, status) => {
            if (
                status === google.maps.places.PlacesServiceStatus.OK &&
                place &&
                place.geometry &&
                place.geometry.location
            ) {
                // good
                // console.log(place);
                if (Number.isInteger(index)) {
                    return callback(place, index);
                }
                else {
                    return callback(place);
                }
            } else {
                console.log(status);
            }
        })
    }
    else {
        console.log("no target id");
        return callback(false);
    }

}

class BusinessHolder{
    constructor(){
        this.MyHashTable = new hashtable;
        this.MyBusinesses = [];
    }
    /**
     * Adds Business
     * @param {String} placeID 
     * @param {int} array_index  
     * @param {LatLngObject} location 
     * @param {String} name 
     * @param {Function} callback called after object is created
     * @param {Float} waitTime what is the wait time at the location
     * @return {Business} Null if failed
     */
    async addBusiness(placeID, location = null, name = null, callback = null, waitTime = null){
        if (!(await MyHashTable.doesExistorAdd(element.place_id, markers.length))) { // check if in HashTable
            x = new Business(placeID, location, name, callback, MyBusinesses.length);
            MyBusinesses.push(x);
            return x;
        }else{
            return null;
        }
    }

    hideBusinessMarkers(){
        for (i in this.MyBusinesses){
            this.MyBusinesses[i].hideMarker();
        }
    }

}