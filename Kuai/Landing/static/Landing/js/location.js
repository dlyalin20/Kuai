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
    /**
     * @param {Object} options 
     * @param {String} options.placeID  - Google PlaceID for biz
     * @param {LatLngObject|undefined} options.location  - location
     * @param {String|undefined} options.name  - name of the Biz
     * @param {String|undefined} options.icon  - url for Biz icon
     * @param {Float|undefined} options.waitTime - Passed wait time from our db
     * @param {int} array_index  - what index is this object stored at
     * @param {Function|undefined} callback  - callback function to be called after initialization

     */
    constructor(options, array_index, callback) {
        const hold = this;
        if (options.waitTime != null){ 
            this.waitTime = Math.round(options.waitTime); // round wait time to a whole number
        }
        this.placeID = options.placeID;
        this.infowindow = new google.maps.InfoWindow;
        this.array_index = array_index; 
        this.callback = callback;
        if (options.location != null && options.name != null) {        
            // we have all the infomation just plug it in
            this.pendinginfo = true; // dont need to wait for the pending info
            this.name = options.name;
            this.position = options.location;
            const markerOptions = {
                position: this.position,
            }
            if (options.icon != null){
                markerOptions.icon = options.icon;
            }
            this.marker = new google.maps.Marker(markerOptions);
            setmarkerCallBack(hold);
        } else {
            //if we dont have essential info: run Places Details request
            
            this.pendinginfo = new Promise(function(accept, r){ 
                //save promise to test if the important information has arrived yet
                queryService(hold.placeID, function (results) {
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
                        icon:icon,
                        position: hold.position
                    });
                    setmarkerCallBack(hold);
                    accept();
                    
                });
            })

        } 
        if (this.callback){
            this.callback();   
        }
        
    }     
    

    async getName(){
        await this.pendinginfo;
        return this.name;        
    }
    async showMarker() {
        await this.pendinginfo;
        // setmarkerCallBack(self);
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
        await this.pendinginfo;
        var i = this.array_index + 1;
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
            targetBiz = this;
            load_route_to_biz(this);
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
    const parent = thisObj;
    google.maps.event.addListener(parent.marker, "click", () => {
        parent.ToggleThisPopUp();
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
     * adds Business
     * @param {Object} options 
     * @property {String} options.placeID  - Google PlaceID for biz
     * @property {LatLngObject} options.location  - location
     * @property {String} options.name  - name of the Biz
     * @property {String} options.icon  - url for Biz icon
     * @property {Float} options.waitTime - Passed wait time from our db
     * @param {Function} callback  - callback function to be called after initialization
     */
    async addBusiness(options, callback){
        //Check if placeID not already found | Save hash with the index of the Bis
        let notfound = !(await this.MyHashTable.doesExistorAdd(options.place_id, this.MyBusinesses.length));
        if (notfound) { // check if in HashTable
            let x = new Business(options, this.MyBusinesses.length, callback);
            this.MyBusinesses.push(x);
        }
    }

    hideMarkers(){
        for (let i in this.MyBusinesses){
            this.MyBusinesses[i].hideMarker();
        }
    }
    
    reset(){
        this.hideMarkers();
        this.MyHashTable = new hashtable;
        this.MyBusinesses = [];
    }

    /**
     * Sets the wait time of a Busniess
     * @param {String} place_id
     * @param {Int} waitTime
     */
    async setWaitTime(place_id, waitTime){
        let index = await bizHash.getIndex(place_id);
        if (this.MyBusinesses[index]){
            this.MyBusinesses[index].waitTime = waitTime;
        }
    }

}