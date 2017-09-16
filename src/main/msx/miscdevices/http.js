// Written by Yasuhiro Yamazaki
wmsx.HTTP = function() {
"use strict";

    this.connectBus = function(bus) {

        bus.connectInputDevice( 0x8e, this.readDocument);
        bus.connectOutputDevice( 0x8e, this.request);

        wmsx.Util.log("Connected to HTTP feature as an I/O device.");
    }

    this.powerOn = function() {
        this.reset();

        //wmsx.Util.log("Initialized HTTP feature in the MSX.");

    };

    this.powerOff = function() {
        //wmsx.Util.log("Release HTTP feature.");
    };

    this.reset = function() {
        request_url = "";
        status = 0;
        document = 0;
        status_x00 = true;
        status_0xx = true;
        pointer = 0;
        endOfDocument = true;

        //wmsx.Util.log("Reset HTTP feature.");
    };

    this.readDocument = function() {

        //wmsx.Util.log("Read document call via the BUS.");

        if(endOfDocument){
            //wmsx.Util.log("No more document to read.");
            return 0;
        }

        if(!status_x00){
            //wmsx.Util.log("Return a status of x00: "+(status/100));
            status_x00 = true;
            return parseInt(status / 100);
        }
        if(!status_0xx){
            //wmsx.Util.log("Return a status of 0xx: "+(status%100));
            status_0xx = true;
            return status % 100;
        }

        var ret = document.charAt(pointer);
        //wmsx.Util.log("Return a char code: "+ret.charCodeAt(0));
        pointer = pointer + 1;
        if(document.length <= pointer){
            //wmsx.Util.log("Reach at the end of document.");
            endOfDocument = true;
        }
        return ret.charCodeAt(0);
    };

    this.request = function(str) {
        //wmsx.Util.log("Write a request call via the BUS.");

        if(str==0){
            endOfDocument = false;
            status_x00 = false;
            status_0xx = false;
            pointer = 0;

            wmsx.Util.log("Access to "+request_url);
            try {
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", request_url, false ); // false for synchronous request
                xmlHttp.send( null );
                status = parseInt(xmlHttp.status);
                document = xmlHttp.responseText;
                wmsx.Util.log("HTTP Response Status Code: "+status);
                wmsx.Util.log("Content: "+document);
            } catch(e) {
                wmsx.Util.log("Something wrong...");
                status = 999;
                document = "Something wrong in the HTTP request routine.";
            }
            request_url = "";
            return;
        }
        request_url = request_url + String.fromCharCode(str);
        return;
    };

    var request_url;
    var status;
    var document;
    var status_x00, status_0xx;
    var pointer;
    var endOfDocument;
};
