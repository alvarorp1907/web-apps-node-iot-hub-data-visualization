/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
$(document).ready(() => {
  // if deployed to a site supporting SSL, use wss://
  const protocol = document.location.protocol.startsWith('https') ? 'wss://' : 'ws://';
  const webSocket = new WebSocket(protocol + location.host);

  // A class for holding the last N points of telemetry for a device
  class DeviceData {
    constructor(deviceId,isSimulated) {
      this.deviceId = deviceId;
      this.maxLen = 50;//50 measures can be plot at same time
	  this.timeData = new Array(this.maxLen);
	  this.isSimulated = isSimulated;
	  
	  if (isSimulated){
		  //console.log("Constructor sensor simulado");
          this.bloodGlucoseData = new Array(this.maxLen);
	      this.endTidalCO2Data = new Array(this.maxLen);
	      this.arrhythmiaIndex = new Array(this.maxLen);
	  }else{
		  //console.log("Constructor sensor real");
          this.BatteryVoltage = new Array(this.maxLen);
	      this.BloodPressureDiastolitic = new Array(this.maxLen);
	      this.BloodPressureSystolic = new Array(this.maxLen);
		  this.HeartRate = new Array(this.maxLen);
		  this.Latitude = new Array(this.maxLen);
		  this.Longitude = new Array(this.maxLen);
		  this.MessageCounter = new Array(this.maxLen);
		  this.OxygenSaturation = new Array(this.maxLen);
		  this.PanicAlarm = new Array(this.maxLen);
		  this.RespiratoryRate = new Array(this.maxLen);
		  this.Satellites = new Array(this.maxLen);
		  this.Temperature = new Array(this.maxLen);
	  }
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
  
	addRealData(time, BatteryVoltage, BloodPressureDiastolitic, 
				BloodPressureSystolic, HeartRate, OxygenSaturation, 
				RespiratoryRate, Temperature) {
					
      this.timeData.push(time);
	  this.BatteryVoltage.push(BatteryVoltage);
	  this.BloodPressureDiastolitic.push(BloodPressureDiastolitic);
	  this.BloodPressureSystolic.push(BloodPressureSystolic);
	  this.HeartRate.push(HeartRate);
	  this.OxygenSaturation.push(OxygenSaturation);
      this.RespiratoryRate.push(RespiratoryRate);
	  this.Temperature.push(Temperature);

      if (this.timeData.length > this.maxLen) {
		this.timeData.shift();
        this.BatteryVoltage.shift();
		this.BloodPressureDiastolitic.shift();
		this.BloodPressureSystolic.shift();
		this.HeartRate.shift();
		this.OxygenSaturation.shift();
		this.RespiratoryRate.shift();
        this.Temperature.shift();
      }
    }
	
	isDeviceSimulated(){
		//console.log("Valor de simulacion " + this.isSimulated);
		return this.isSimulated;
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
		   //console.log("Device Id encontrado:" + deviceId);
          return this.devices[i];
        }
      }
	
	  //console.log("Device Id no encontrado:" + deviceId);
      return undefined;
    }

	//get the total number of devices connected
    getDevicesCount() {
      return this.devices.length;
    }
  }

  const trackedDevices = new TrackedDevices();

  // Define the chart axes for simulated Sensors
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
   
  //chart options for simulated sensors
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
          labelString: 'mmHg',
          display: true,
        },
        position: 'left',
      },
	  {
        id: 'arrhythmiaIndex',
        type: 'linear',
        scaleLabel: {
          labelString: 'arrhythmia index',
          display: true,
        },
        position: 'left',
      }]
    }
  };
  
    // Define the chart axes for simulated Sensors
  const chartRealData = {
    datasets: [
      {
        fill: false,
        label: 'BatteryVoltage',
        yAxisID: 'BatteryVoltage',
        borderColor: 'rgba(255, 204, 0, 1)',
        pointBoarderColor: 'rgba(255, 204, 0, 1)',
        backgroundColor: 'rgba(255, 204, 0, 0.4)',
        pointHoverBackgroundColor: 'rgba(255, 204, 0, 1)',
        pointHoverBorderColor: 'rgba(255, 204, 0, 1)',
        spanGaps: true,
      },
	  {
      fill: false,
      label: 'BloodPressureDiastolitic',
      yAxisID: 'BloodPressureDiastolitic',
      borderColor: 'rgba(255, 99, 132, 1)',
      pointBorderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.4)',
      pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
      pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
      spanGaps: true,
    },
    {
      fill: false,
      label: 'BloodPressureSystolic',
      yAxisID: 'BloodPressureSystolic',
      borderColor: 'rgba(54, 162, 235, 1)',
      pointBorderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.4)',
      pointHoverBackgroundColor: 'rgba(54, 162, 235, 1)',
      pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      spanGaps: true,
    },
    {
      fill: false,
      label: 'HeartRate',
      yAxisID: 'HeartRate',
      borderColor: 'rgba(75, 192, 192, 1)',
      pointBorderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.4)',
      pointHoverBackgroundColor: 'rgba(75, 192, 192, 1)',
      pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
      spanGaps: true,
    },
    {
      fill: false,
      label: 'OxygenSaturation',
      yAxisID: 'OxygenSaturation',
      borderColor: 'rgba(153, 102, 255, 1)',
      pointBorderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.4)',
      pointHoverBackgroundColor: 'rgba(153, 102, 255, 1)',
      pointHoverBorderColor: 'rgba(153, 102, 255, 1)',
      spanGaps: true,
    },
    {
      fill: false,
      label: 'RespiratoryRate',
      yAxisID: 'RespiratoryRate',
      borderColor: 'rgba(255, 159, 64, 1)',
      pointBorderColor: 'rgba(255, 159, 64, 1)',
      backgroundColor: 'rgba(255, 159, 64, 0.4)',
      pointHoverBackgroundColor: 'rgba(255, 159, 64, 1)',
      pointHoverBorderColor: 'rgba(255, 159, 64, 1)',
      spanGaps: true,
    },
	{
      fill: false,
      label: 'Temperature',
      yAxisID: 'Temperature',
      borderColor: 'rgba(0, 200, 83, 1)',
      pointBorderColor: 'rgba(0, 200, 83, 1)',
      backgroundColor: 'rgba(0, 200, 83, 0.4)',
      pointHoverBackgroundColor: 'rgba(0, 200, 83, 1)',
      pointHoverBorderColor: 'rgba(0, 200, 83, 1)',
      spanGaps: true,
	}]
   };
   
   //chart options for simulated sensors
   const chartRealOptions = {
    scales: {
      yAxes: [{
        id: 'BatteryVoltage',
        type: 'linear',
        scaleLabel: {
          labelString: 'V',
          display: true,
        },
        position: 'left',
      },
	  {
        id: 'BloodPressureDiastolitic',
        type: 'linear',
        scaleLabel: {
          labelString: 'ver',
          display: true,
        },
        position: 'left',
      },
	  {
        id: 'BloodPressureSystolic',
        type: 'linear',
        scaleLabel: {
          labelString: 'Ver',
          display: true,
        },
        position: 'left',
      },
	  {
        id: 'HeartRate',
        type: 'linear',
        scaleLabel: {
          labelString: 'ver',
          display: true,
        },
        position: 'left',
      },
	  {
        id: 'OxygenSaturation',
        type: 'linear',
        scaleLabel: {
          labelString: 'ver',
          display: true,
        },
        position: 'left',
      },
	  {
        id: 'RespiratoryRate',
        type: 'linear',
        scaleLabel: {
          labelString: 'ver',
          display: true,
        },
        position: 'left',
      },
	  {
        id: 'Temperature',
        type: 'linear',
        scaleLabel: {
          labelString: 'ver',
          display: true,
        },
        position: 'left',
      }]
    }
  };

  // Get the context of the canvas element we want to select
  const ctx = document.getElementById('iotChart').getContext('2d');
  //for simulated Sensors
  const myLineChart = new Chart(
    ctx,
    {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });

  // for real sensors
  const myLineRealChart = new Chart(
    ctx,
    {
      type: 'line',
      data: chartRealData,
      options: chartRealOptions,
    });

  // Manage a list of devices in the UI, and update which device data the chart is showing
  // based on selection
  let needsAutoSelect = true;
  const deviceCount = document.getElementById('deviceCount');
  const listOfDevices = document.getElementById('listOfDevices');
  function OnSelectionChange() {
    const device = trackedDevices.findDevice(listOfDevices[listOfDevices.selectedIndex].text);
	//graph selection depending on the type of device (real or simulated)
	if (device.isDeviceSimulated()){
		chartData.labels = device.timeData;
        chartData.datasets[0].data = device.bloodGlucoseData || [];
	    chartData.datasets[1].data = device.endTidalCO2Data || [];
	    chartData.datasets[2].data = device.arrhythmiaIndex || [];
		console.log("Datos antes de actualizar: "+ chartData.datasets[0].data)
        myLineChart.update();
	}else{
		chartRealData.labels = device.timeData;
		chartRealData.datasets[0].data = device.BatteryVoltage || [];
		chartRealData.datasets[1].data = device.BloodPressureDiastolitic || [];
		chartRealData.datasets[2].data = device.BloodPressureSystolic || [];
		chartRealData.datasets[3].data = device.HeartRate || [];
		chartRealData.datasets[4].data = device.OxygenSaturation || [];
		chartRealData.datasets[5].data = device.RespiratoryRate || [];
        chartRealData.datasets[6].data = device.Temperature || [];
        myLineRealChart.update();
	}
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

      //ToDo: enhance this condition
      if (!messageData.MessageDate){
		  return;
	  }

      // find or add device to list of tracked devices
      const existingDeviceData = trackedDevices.findDevice(messageData.DeviceId);

      if (existingDeviceData) {
		if (existingDeviceData.isDeviceSimulated()){
			existingDeviceData.addData(messageData.MessageDate, messageData.IotData.bloodGlucose, messageData.IotData.endTidalCO2, messageData.IotData.arrhythmiaIndex );
			console.log("Adding new data for simulated sensor");
		}else{
			existingDeviceData.addRealData(messageData.MessageDate, messageData.IotData.BatteryVoltage, messageData.IotData.BloodPressureDiastolitic, messageData.IotData.BloodPressureSystolic, messageData.IotData.HeartRate, messageData.IotData.OxygenSaturation, messageData.IotData.RespiratoryRate ,messageData.IotData.Temperature);
			console.log("Adding new data for real sensor");
		}
      } else {
		  
        const newDeviceData = new DeviceData(messageData.DeviceId,messageData.IotData.isSimulated);
        trackedDevices.devices.push(newDeviceData);
        const numDevices = trackedDevices.getDevicesCount();
        deviceCount.innerText = numDevices === 1 ? `${numDevices} device` : `${numDevices} devices`;
		
		if (newDeviceData.isDeviceSimulated()){
			newDeviceData.addData(messageData.MessageDate, messageData.IotData.bloodGlucose, messageData.IotData.endTidalCO2, messageData.IotData.arrhythmiaIndex);
			console.log("First time adding new data for simulated sensor: " + messageData.IotData.bloodGlucose);
		}else{
			newDeviceData.addRealData(messageData.MessageDate, messageData.IotData.BatteryVoltage, messageData.IotData.BloodPressureDiastolitic, messageData.IotData.BloodPressureSystolic, messageData.IotData.HeartRate, messageData.IotData.OxygenSaturation, messageData.IotData.RespiratoryRate ,messageData.IotData.Temperature);
			console.log("First time adding new data for real sensor: " + messageData.IotData.Temperature);
		}

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
	  
	  //update chart depeding of the sensor that is currently selected on screen
	  let DeviceActiveStr = listOfDevices.options[listOfDevices.selectedIndex].text;
	  console.log("ID select activo " + DeviceActiveStr);
	  let activeDevice = trackedDevices.findDevice(DeviceActiveStr);
	  let updateChartForSimulated = activeDevice.isDeviceSimulated() == true ? true : false;
	  
	  if (updateChartForSimulated){
		  console.log("Actualizando grafico para sensores simulados");
		  myLineChart.update(); 
	  }else{
		  console.log("Actualizando grafico para sensores reales");
		  myLineRealChart.update();
	  } 
	  
    } catch (err) {
      console.error(err);
    }
  };
});
