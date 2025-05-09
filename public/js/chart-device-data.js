/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId) {
      this.deviceId = deviceId;
      this.maxLen = 50;//50 measures can be plot at same time
      this.timeData = new Array(this.maxLen);
      this.bloodGlucoseData = new Array(this.maxLen);
	  this.endTidalCO2Data = new Array(this.maxLen);
	  this.arrhythmiaIndex = new Array(this.maxLen);
    }

    addData(time, bloodGlucoseData, endTidalCO2Data, arrhythmiaIndex) {
      this.timeData.push(time);
      this.bloodGlucoseData.push(bloodGlucoseData);
	  this.endTidalCO2Data.push(endTidalCO2Data);
	  this.arrhythmiaIndex.push(arrhythmiaIndex);

      if (this.timeData.length > this.maxLen) {
        this.timeData.shift();
        this.bloodGlucoseData.shift();
		this.endTidalCO2Data.shift();
		this.arrhythmiaIndex.shift();
      }
    }
  }

  // All the devices in the list (those that have been sending telemetry)
  class TrackedDevices {
    constructor() {
      this.devices = [];
    }

    // Find a device based on its Id
    findDevice(deviceId) {
      for (let i = 0; i < this.devices.length; ++i) {
        if (this.devices[i].deviceId === deviceId) {
		   console.log("Device Id encontrado:" + deviceId);
          return this.devices[i];
        }
      }
	
	  console.log("Device Id no encontrado:" + deviceId);
      return undefined;
    }

	//get the total number of devices connected
    getDevicesCount() {
      return this.devices.length;
    }
  }

  const trackedDevices = new TrackedDevices();

  // Define the chart axes
  const chartData = {
    datasets: [
      {
        fill: false,
        label: 'bloodGlucose',
        yAxisID: 'bloodGlucose',
        borderColor: 'rgba(255, 204, 0, 1)',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
      },
	  {
        fill: false,
        label: 'endTidalCO2',
        yAxisID: 'endTidalCO2',
        borderColor: 'rgba(24, 120, 240, 1)',
        pointBoarderColor: 'rgba(24, 120, 240, 1)',
        backgroundColor: 'rgba(24, 120, 240, 0.4)',
        pointHoverBackgroundColor: 'rgba(24, 120, 240, 1)',
        pointHoverBorderColor: 'rgba(24, 120, 240, 1)',
        spanGaps: true,
      },
	  {
        fill: false,
        label: 'arrhythmiaIndex',
        yAxisID: 'arrhythmiaIndex',
        borderColor: 'rgba(34, 193, 47, 1)',
		pointBorderColor: 'rgba(34, 193, 47, 1)',
		backgroundColor: 'rgba(34, 193, 47, 0.4)',
		pointHoverBackgroundColor: 'rgba(34, 193, 47, 1)',
		pointHoverBorderColor: 'rgba(34, 193, 47, 1)',     
        spanGaps: true,
      }]
   };

  const chartOptions = {
    scales: {
      yAxes: [{
        id: 'bloodGlucose',
        type: 'linear',
        scaleLabel: {
          labelString: 'mg/dL',
          display: true,
        },
        position: 'left',
      },
	  {
        id: 'endTidalCO2',
        type: 'linear',
        scaleLabel: {
          labelString: 'CO2',
          display: true,
        },
        position: 'right',
      },
	  {
        id: 'arrhythmiaIndex',
        type: 'linear',
        scaleLabel: {
          labelString: 'arrhythmia index',
          display: true,
        },
        position: 'right',
      }]
    }
  };

  // Get the context of the canvas element we want to select
  const ctx = document.getElementById('iotChart').getContext('2d');
  const myLineChart = new Chart(
    ctx,
    {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });

  // Manage a list of devices in the UI, and update which device data the chart is showing
  // based on selection
  let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  const listOfDevices = document.getElementById('listOfDevices');
  function OnSelectionChange() {
    const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
    chartData.labels = device.timeData;
    chartData.datasets[0].data = device.bloodGlucoseData || [];;
	chartData.datasets[1].data = device.endTidalCO2Data || [];;
	chartData.datasets[2].data = device.arrhythmiaIndex || [];;
    myLineChart.update();
  }
  listOfDevices.addEventListener('change', OnSelectionChange, false);

  // When a web socket message arrives:
  // 1. Unpack it
  // 2. Validate it has date/time and value
  // 3. Find or create a cached device to hold the telemetry data
  // 4. Append the telemetry data
  // 5. Update the chart UI
  webSocket.onmessage = function onMessage(message) {
    try {
      const messageData = JSON.parse(message.data);
      console.log(messageData);

      //this current version doesn't support parsing capabilities for real sensors
      if (!messageData.MessageDate){
		  return;
	  }

      // find or add device to list of tracked devices
      const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);

      if (existingDeviceData) {
        existingDeviceData.addData(messageData.MessageDate, messageData.IotData.bloodGlucose, messageData.IotData.endTidalCO2, messageData.IotData.arrhythmiaIndex );
      } else {
        const newDeviceData = new DeviceData(messageData.DeviceId);
        trackedDevices.devices.push(newDeviceData);
        const numDevices = trackedDevices.getDevicesCount();
        deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
        newDeviceData.addData(messageData.MessageDate, messageData.IotData.bloodGlucose, messageData.IotData.endTidalCO2, messageData.IotData.arrhythmiaIndex);

        // add device to the UI list
        const node = document.createElement('option');
        const nodeText = document.createTextNode(messageData.DeviceId);
        node.appendChild(nodeText);
        listOfDevices.appendChild(node);

        // if this is the first device being discovered, auto-select it
        if (needsAutoSelect) {
          needsAutoSelect = false;
          listOfDevices.selectedIndex = 0;
          OnSelectionChange();
        }
      }

      myLineChart.update();
    } catch (err) {
      console.error(err);
    }
  };
});
