class hashtable {
    constructor(){
        this.list = [];
    }
    async doesExistorAdd(placeID, array_index_plus1) {
        var x = await getHash(placeID)
        var dv = new DataView(x);
        var hash = dv.getInt32();
        if (this.list[hash]){
            return true;
        }else{
            this.list[hash] = array_index_plus1;
            return false;
        }
    }
}

class Business{
    // location new google.maps.LatLng(location);
    //Call back is run after contructor is done
    constructor(placeID, location=null, name=null, callback=null, array_index){
        this.placeID = placeID;
        this.infowindow = new google.maps.InfoWindow;
        this.callback = callback;
        this.array_index_plus1 = array_index + 1; // plus one to avoid the number coming back as false
        if (!(location && name)){ 
            // run Places Details request to get lat lng and name
            const hold = this;
            let y = queryService(placeID, function(x){
                hold.fillLocals(x);
                hold.callback();
            });
        }else{
            this.name = name;
            this.position = location;
            this.marker = new google.maps.Marker({
                position: this.position
            });
            google.maps.event.addListener(this.marker, "click", () => {
                this.infowindow.setContent(this.name || "");
                this.infowindow.open(map);
            });
            if (callback){
                this.callback();
            }
        }
    

        
        
    }
    
    fillLocals( results){
        let pos = results.geometry.location
        // temp = new Promise(accept, reject){
        // }
        // this.position = new google.maps.LatLng(pos.lat(),  pos.lng());
        // let x = settleCoords(pos.lat,  pos.lng); // hold promise that we will await later
        // console.log(x);
        // this.position = x;

        this.position = pos;
        this.name = results.name;
    }

    async showMarker(){
        if (!(this.position && this.marker)){
            this.marker = new google.maps.Marker({
                position: await this.position
            });
            google.maps.event.addListener(this.marker, "click", () => {
                infowindow.setContent(this.name || "");
                infowindow.open(map);
            });
        }
        this.marker.setMap(map);
    }
    addHash(){
        bizHash.doesExistorAdd(this.placeID, this.array_index_plus1);
    }

    async testHash(){
        //if place_id hash already exists returns true
        //else returns false
        return await bizHash.doesExistorAdd(this.placeID, this.array_index_plus1);
    }
    hideMarker(){
        if (this.marker){
            this.marker.setMap(null);
        }        
    }

    async pushDivDescription(){
        var i = this.array_index_plus1;
        if (!(this.position && this.marker)){
            await this.position;
            this.marker = new google.maps.Marker({
                position: this.position
            });
        }
        this.showMarker();
        let baseObject = `<div class='option-items'>` + i + '. ' + this.name + '|' + this.position + `</div>`;
        console.log(baseObject);
        const parent = this;
        let myDiv = $(baseObject)
            .on("click", function(){
                map.panTo(parent.position)
                map.setZoom(18);
            })
            .css("order", i)
            .appendTo(choices)

        // console.log(myDiv);
        // choices.append(myDiv);


    }
}
// Run SHA-256 on data
async function getHash(string){
    const encoder = new TextEncoder();
    const data = encoder.encode(string);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return hash;
} 

async function settleCoords(lat, lng){
    let templat = await lat();
    let templng = await lng();
    return new google.maps.LatLng(templat,  templng)
}