// Copyright 2015 by Paulo Augusto Peccin. See license.txt distributed with this file.

// MSX2 Standard RAM Mapper. Supports sizes from 128KB to 4MB

wmsx.SlotRAMMapper = function(content, size) {

    function init(self) {
        if (content) {
            bytes = content;
        } else {
            var i = 0;
            while (VALID_SIZES[i] < size && i < VALID_SIZES.length - 1) i++;
            var newSize = VALID_SIZES[i];
            bytes = new Array(newSize * 1024);
        }
        self.bytes = bytes;
        pageMask = ((bytes.length / 16384) | 0) - 1;
    }

    this.powerOff = function() {
        // Lose content
        wmsx.Util.arrayFill(bytes, 0x00);
        wmsx.Util.arrayFill(pageOffsets, 0);
    };

    this.connect = function(machine) {
        machine.bus.connectOutputDevice(0xfc, this.outputFC);
        machine.bus.connectOutputDevice(0xfd, this.outputFD);
        machine.bus.connectOutputDevice(0xfe, this.outputFE);
        machine.bus.connectOutputDevice(0xff, this.outputFF);
    };

    this.disconnect = function(machine) {
        machine.bus.disconnectOutputDevice(0xfc);
        machine.bus.disconnectOutputDevice(0xfd);
        machine.bus.disconnectOutputDevice(0xfe);
        machine.bus.disconnectOutputDevice(0xff);
    };

    this.outputFC = function(val) {
        pageOffsets[0] = (val & pageMask) * 16384;
    };
    this.outputFD = function(val) {
        pageOffsets[1] = (val & pageMask) * 16384 - 16384;
    };
    this.outputFE = function(val) {
        pageOffsets[2] = (val & pageMask) * 16384 - 32768;
    };
    this.outputFF = function(val) {
        pageOffsets[3] = (val & pageMask) * 16384 - 49152;
    };

    this.read = function(address) {
        //wmsx.Util.log ("RAM Mapper read: " + address.toString(16) + ", " + bytes[address].toString(16));
        return bytes[address + pageOffsets[address >>> 14]];
    };

    this.write = function(address, value) {
        //wmsx.Util.log ("RAM Mapper write: " + address.toString(16) + ", " + value.toString(16));
        bytes[address + pageOffsets[address >>> 14]] = value;
    };


    var bytes;
    var pageOffsets = [ 0, 0, 0, 0 ];
    var pageMask = 0;

    this.bytes = null;
    this.format = wmsx.SlotFormats.RAMMapper;

    var VALID_SIZES = [64, 128, 256, 512, 1024, 2048, 4096];

    // Savestate  -------------------------------------------

    this.saveState = function() {
        return {
            f: this.format.name,
            b: wmsx.Util.compressInt8BitArrayToStringBase64(bytes),
            p0: pageOffsets[0], p1: pageOffsets[1], p2: pageOffsets[2], p3: pageOffsets[3]
        };
    };

    this.loadState = function(state) {
        bytes = wmsx.Util.uncompressStringBase64ToInt8BitArray(state.b, bytes);
        this.bytes = bytes;
        pageMask = ((bytes.length / 16384) | 0) - 1;
        pageOffsets[0] = state.p0; pageOffsets[1] = state.p1; pageOffsets[2] = state.p2; pageOffsets[3] = state.p3;
    };


    if (content || size >= 0) init(this);

};

wmsx.SlotRAMMapper.prototype = wmsx.Slot.base;

wmsx.SlotRAMMapper.createNew = function(size) {
    return new wmsx.SlotRAMMapper(null, size);
};

wmsx.SlotRAMMapper.recreateFromSaveState = function(state, previousSlot) {
    var ram = previousSlot || new wmsx.SlotRAMMapper(null, null);
    ram.loadState(state);
    return ram;
};