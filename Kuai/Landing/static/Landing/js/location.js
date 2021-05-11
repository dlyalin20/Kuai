class Business{
    // location new google.maps.LatLng(location);
    //Call back is run after contructor is done
    constructor(placeID, location=null, name=null, callback=null){
        this.placeID = placeID;
        this.infowindow = new google.maps.InfoWindow;
        this.callback = callback;
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

    hideMarker(){
        if (this.marker){
            this.marker.setMap(null);
        }        
    }

    async pushDivDescription(i){
        if (!(this.position && this.marker)){
            await this.position;
            this.marker = new google.maps.Marker({
                position: this.position
            });
        }
        this.showMarker();
        // jQuery('<div/>', {
        //     "class": '<div class="option-items>"',
        //     'css': 'now this div has a title!',
        //     'style': "order:" + i,
        // }).on("click", function(){
        //     map.setCenter(this.position)
        // }).appendTo('choices');
        console.log(`<div class='option-items'>` + (i + 1) + '. ' + this.name + '|' + this.position + `</div>`);
        const parent = this;
        let myDiv = $(`<div class='option-items'>` + (i + 1) + '. ' + this.name + '|' + this.position + `</div>`)
            .on("click", function(){
                map.setCenter(parent.position)
            })
            .css("order", i)
            .appendTo(choices)

        // console.log(myDiv);
        // choices.append(myDiv);


    }

    // toHash(){
    //     temp = "";
    //     for (var i = 0; i < this.placeID.length; i++){
    //         let charater = this.placeID.charAt(i);
    //         if (!isNaN(charater)){
    //             // if its a number
    //             temp += charater;
    //         }else{
    //             // convert to ascii
                
    //         }
    //     }
    //     return 
    // }
}

async function settleCoords(lat, lng){
    let templat = await lat();
    let templng = await lng();
    return new google.maps.LatLng(templat,  templng)
}