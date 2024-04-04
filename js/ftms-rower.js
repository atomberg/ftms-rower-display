// UUID list
// https://bitbucket.org/bluetooth-SIG/public/src/main/assigned_numbers/uuids/characteristic_uuids.yaml
const serviceFTMS = 0x1826;
const treadmillData = 0x2acd;
const rowerData = 0x2ad1;


function connect() {
    console.log('Requesting FTMS Bluetooth Device...');
    return navigator.bluetooth.requestDevice({
        filters: [{
            services: [serviceFTMS],
        }]
    })
        .then(device => {
            console.log('Connecting to GATT Server...');
            return device.gatt.connect();
        })
        .then(server => {
            console.log('Getting Service...');
            return server.getPrimaryService(serviceFTMS);
        })
        .then(service => {
            console.log('Getting Characteristic...');
            return service.getCharacteristic(rowerData);
        })
        .then(characteristic => {
            characteristic.startNotifications().then(_ => {
                console.log('> Notifications started');
                // characteristic.addEventListener('characteristicvaluechanged', handleNotifications);
            });
            return characteristic;
        })
        .catch(error => {
            console.log('Argh! ' + error);
        });
}



// Field descriptions and lengths:
// https://bitbucket.org/bluetooth-SIG/public/src/main/gss/org.bluetooth.characteristic.rower_data.yaml

function parseRowerData(value) {
    let a = [];

    // Convert raw data bytes to hex values in order to console log each notification.
    for (let i = 0; i < value.byteLength; i++) {
        a.push('0x' + ('00' + value.getUint8(i).toString(16)).slice(-2));
    }
    console.log('> ' + a.join(' '));

    var flags = value.getUint16(0, littleEndian = true);
    let byteIndex = 2;
    var data = [];

    if ((flags & (1 << 0)) == 0) {
        data['Stroke Rate'] = value.getUint8(byteIndex, littleEndian = true);
        byteIndex += 1;

        data['Stroke Count'] = value.getUint16(byteIndex, littleEndian = true);
        byteIndex += 2;
    }

    if ((flags & (1 << 1)) != 0) {
        data['Average Stroke Rate'] = value.getUint8(byteIndex, littleEndian = true);
        byteIndex += 1;
    }

    if ((flags & (1 << 2)) != 0) {
        data['Total Distance'] = value.getUint16(byteIndex, littleEndian = true) + (value.getUint8(byteIndex + 2, littleEndian = true) << 16);
        byteIndex += 3;
    }

    if ((flags & (1 << 3)) != 0) {
        data['Instantaneous Pace'] = value.getUint16(byteIndex, littleEndian = true);
        byteIndex += 2;
    }

    if ((flags & (1 << 4)) != 0) {
        data['Average Pace'] = value.getUint16(byteIndex, littleEndian = true);
        byteIndex += 2;
    }

    if ((flags & (1 << 5)) != 0) {
        data['Instantaneous Power'] = value.getInt16(byteIndex, littleEndian = true);
        byteIndex += 2;
    }

    if ((flags & (1 << 6)) != 0) {
        data['Average Power'] = value.getInt16(byteIndex, littleEndian = true);
        byteIndex += 2;
    }

    if ((flags & (1 << 7)) != 0) {
        data['Resistance Level'] = value.getUint8(byteIndex, littleEndian = true);
        byteIndex++;
    }

    if ((flags & (1 << 8)) != 0) {
        data['Total Energy'] = value.getUint16(byteIndex, littleEndian = true);
        byteIndex += 2;

        data['Energy Per Hour'] = value.getUint16(byteIndex, littleEndian = true);
        byteIndex += 2;

        data['Energy Per Minute'] = value.getUint8(byteIndex, littleEndian = true);
        byteIndex += 1;
    }

    if ((flags & (1 << 9)) != 0) {
        data['Heart Rate'] = value.getUint8(byteIndex, littleEndian = true);
        byteIndex += 1;
    }

    if ((flags & (1 << 10)) != 0) {
        data['Metabolic Equivalent'] = value.getUint8(byteIndex, littleEndian = true);
        byteIndex += 1;
    }

    if ((flags & (1 << 11)) != 0) {
        data['Elapsed Time'] = value.getUint16(byteIndex, littleEndian = true);
        byteIndex += 2;
    }

    if ((flags & (1 << 12)) != 0) {
        data['Remaining Time'] = value.getUint16(byteIndex, littleEndian = true);
        byteIndex += 2;
    }

    return data;
}