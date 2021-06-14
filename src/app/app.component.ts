import { Component } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { environment } from '../environments/environment';
const subject = webSocket(environment.wsEndpoint);
import { Chart} from 'angular-highcharts';

export interface CityGroup {
  city: string;
  aqi: number;
  lastUpdated?: Date;
  timestamp?: Date;
  class?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showCity = false;
  chart: Chart;
  title = 'aqi-quality-check';
  logCityAqiArray: Array<CityGroup> = [];
  cityAqiArray: Array<CityGroup> = [];
  singleCityAqiArray: Array<CityGroup> = [];
  constructor() {
    subject.subscribe(
      (response: Array<CityGroup>)=> this.getData(response), // Called whenever there is a message from the server.
      err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      () => console.log('complete') // Called when connection is closed (for whatever reason).
    );
  }

  getData(response: Array<CityGroup>) {
    let isFind: boolean;
    let colorClass: string;
    for (let i=0; i < response.length; i++) {
      isFind = false;
      colorClass = this.getColorClass(response[i].aqi);
      this.logCityAqiArray.push({city: response[i].city, aqi: response[i].aqi, timestamp: new Date(), class: colorClass});
      if (this.showCity && this.singleCityAqiArray.length > 0 && this.singleCityAqiArray[0].city === response[i].city) {
        this.singleCityAqiArray.push({city: response[i].city, aqi: response[i].aqi, timestamp: new Date(), class: colorClass});
        this.drawChart();
      }
      for (let j = 0; j < this.cityAqiArray.length; j++) {
        if (this.cityAqiArray[j].city === response[i].city) {
          isFind = true;
          this.cityAqiArray[j].aqi = response[i].aqi;
          this.cityAqiArray[j].lastUpdated = new Date();
          this.cityAqiArray[j].class = colorClass;
        }
      }
      if (!isFind) {
        this.cityAqiArray.push({city: response[i].city, aqi: response[i].aqi, lastUpdated: new Date(), class: colorClass});
      }
    }
  }

  getColorClass(aqi: number) {
    let colorClass;
    if (aqi > 0 && aqi < 50) {
      colorClass = 'green';
    } else if (aqi > 50 && aqi < 100) {
      colorClass = 'gray';
    } else if (aqi > 100 && aqi < 200) {
      colorClass = 'orange';
    } else if (aqi > 200 && aqi < 300) {
      colorClass = 'yellow';
    } else if (aqi > 300 && aqi < 400) {
      colorClass = 'red';
    } else if (aqi > 400 && aqi < 500) {
      colorClass = 'darkRed';
    }
    return colorClass;
  }

  showMore(city: string) {
    this.showCity = true;
    this.singleCityAqiArray = [];
    for (let i = 0; i < this.logCityAqiArray.length; i++) {
      if (this.logCityAqiArray[i].city === city) {
        this.singleCityAqiArray.push({city: this.logCityAqiArray[i].city, aqi: this.logCityAqiArray[i].aqi, timestamp: this.logCityAqiArray[i].timestamp, class: this.logCityAqiArray[i].class});
      }
    }
    this.drawChart();
  }

  drawChart() {
    this.chart = new Chart({
      chart: {
        type: 'line'
      },
      title: {
        text: 'Aqi Quality'
      },
      credits: {
        enabled: false
      },
      xAxis: {
        type: 'datetime',
        categories: this.singleCityAqiArray.map(e => e.timestamp.toISOString())
      },
      yAxis:{
        min:30,
        max:500,
        title: {
          text: "AQI Index"
        },
        gridLineWidth: 0      
      },
      series: [{
        name: this.singleCityAqiArray[0].city,
        type: 'line',
        data: this.singleCityAqiArray.map(e => e.aqi)
      }]
    });
  }
    
}
