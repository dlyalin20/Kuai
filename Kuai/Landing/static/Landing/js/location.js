class hashtable {
    constructor() {
        this.list = [];
    }
    async doesExistorAdd(placeID, array_index_plus1) {
        var x = await getHash(placeID)
        var dv = new DataView(x);
        var hash = dv.getInt32();
        if (this.list[hash]) {
            return true;
        } else {
            this.list[hash] = array_index_plus1;
            return false;
        }
    }
}

var targetBiz;

class Business {
    // location new google.maps.LatLng(location);
    //Call back is run after contructor is done
    constructor(placeID, location = null, name = null, callback = null, array_index, waitTime = null) {
        if (waitTime != null){
            this.waitTime = Math.round(waitTime);
        }
        
        this.placeID = placeID;
        this.infowindow = new google.maps.InfoWindow;
        this.callback = callback;
        this.array_index_plus1 = array_index + 1; // plus one to avoid the number coming back as false
        if (!(location && name)) {
            // run Places Details request to get lat lng and name
            const hold = this;
            let y = queryService(placeID, function (x) {
                hold.fillLocals(x);
                hold.callback();
            });
        } else {
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

    fillLocals(results) {
        let pos = results.geometry.location
        // temp = new Promise(accept, reject){
        // }
        // this.position = new google.maps.LatLng(pos.lat(),  pos.lng());
        // let x = settleCoords(pos.lat,  pos.lng); // hold promise that we will await later
        // console.log(x);
        // this.position = x;

        this.position = pos;
        this.name = results.name;
        this.marker = new google.maps.Marker({
            position: this.position
        });
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
        bizHash.doesExistorAdd(this.placeID, this.array_index_plus1);
    }

    async testHash() {
        //if place_id hash already exists returns true
        //else returns false
        return await bizHash.doesExistorAdd(this.placeID, this.array_index_plus1);
    }
    hideMarker() {
        if (this.marker) {
            this.marker.setMap(null);
        }
    }

    async pushDivDescription() { // what happends when u click on the marker
        var i = this.array_index_plus1;
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

    ToggleThisPopUp() {
        if (targetBiz != null && targetBiz.placeID == this.placeID) {
            closePopUp();
            targetBiz = null;
        } else {
            load_route_to_biz(this);
            targetBiz = this;
            map.panTo(this.position)
            map.setZoom(18);
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
            fields: ["name", "formatted_address", "place_id", "geometry"],
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
                    callback(place, index);
                }
                else {
                    callback(place);
                }
            } else {
                console.log(status);
            }
        })
    }
    else {
        console.log("no target id");
        callback(false);
    }

}