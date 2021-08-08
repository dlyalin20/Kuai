class hashtable {
    constructor() {
        this.list = [];
    }
    async doesExistorAdd(place_id, array_index) {
        var x = await getHash(place_id);
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
     * Get the index in the array of a found place_id
     * @param {String} place_id
     * @return {Int}
     * @return {null}
     */
    async getIndex(place_id){
        var x = await getHash(place_id);
        var dv = new DataView(x);
        var hash = dv.getInt32();
        if (this.list[hash]){
            return this.list[hash] - 1
        }else{
            return false;
        }

    }
}
var bizHash = new hashtable();
var targetBiz;



class Business {
    // location new google.maps.LatLng(location);
    //Call back is run after contructor is done
    /**
     * @param {Object} options
     * @param {String} options.place_id  - Google place_id for biz
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
        this.place_id = options.place_id;
        this.infowindow = new google.maps.InfoWindow;
        this.array_index = array_index;
        this.callback = callback;
        if (options.location != null && options.name != null) {
            // we have all the infomation just plug it in
            this.name = options.name;
            this.position = options.location;
            const markerOptions = {
                position: this.position,
            }
            if (options.icon != null){
                markerOptions.icon = options.icon;
            }
            this.marker = new google.maps.Marker(markerOptions);
            this.pendinginfo = true; // dont need to wait for the pending info
            setmarkerCallBack(hold);
        } else {
            //if we dont have essential info: run Places Details request
            this.pendinginfo = new Promise(function(accept, r){
                //save promise to test if the important information has arrived yet
                queryService(hold.place_id, function (results) {
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
        bizHash.doesExistorAdd(this.place_id, this.array_index);
    }

    async testHash() {
        //if place_id hash already exists returns true
        //else returns false
        return await bizHash.doesExistorAdd(this.place_id, this.array_index);
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
        if (targetBiz != null && targetBiz.place_id == this.place_id) {
            closePopUp();
            targetBiz = null;
        } else {
            targetBiz = this;
            load_route_to_biz(this);
            this.goTo();
            if (this.waitTime) {
                openPopUp(this.name, this.place_id, this.waitTime);
            }
            else {
                openPopUp(this.name, this.place_id);
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
     * @property {String} options.place_id  - Google PlaceID for biz
     * @property {LatLngObject|undefined} options.location  - location
     * @property {String|undefined} options.name  - name of the Biz
     * @property {String|undefined} options.icon  - url for Biz icon
     * @property {Float|undefined} options.waitTime - Passed wait time from our db
     * @param {Function|undefined} callback  - callback function to be called after initialization
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
     * Sets the wait time of a Businesses
     * @param {String} place_id
     * @param {Int} waitTime
     */
    async setWaitTime(place_id, waitTime){
        const that = this;
        this.MyHashTable.getIndex(place_id).then(function(index){
            if (index && that.MyBusinesses[index]){
                that.MyBusinesses[index].waitTime = waitTime;
            }
        })
    }

    /** Sets wait time for many Businesses asynchronously
     * @param {Array} BizData 2d array holding PlaceID and WaitTime data
     * @param {String} BizData[][0] PlaceID
     * @param {Int} BizData[][1] Waittime
    */
    async setManyWaitTimes(BizData){
        for (let i in BizData){
            this.setWaitTime(BizData[i][0], BizData[i][1]);
        }
    }

    /** Get Business object from place_id asynchronously
      @param {String} place_id
      @param {Function | null} callback
      @returns {Business | null}
    */
    async getBusinessFromPlaceId(place_id, callback){
      const that = this;
      // For call back feature
      if (callback){
        callback(
          await this.MyHashTable.getIndex(place_id).then(function(index){
            if (index !== false){
              return that.MyBusinesses[index];
            }else{
              return null;
            }
          })
        )
      }else{
        //  for returning feature
        var index = await this.MyHashTable.getIndex(place_id);
        if (index !== false){
          return that.MyBusinesses[index];
        }else{
          return null;
        }
      }


    }



}
