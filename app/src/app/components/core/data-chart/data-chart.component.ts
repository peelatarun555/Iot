import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import {
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexStroke,
    ApexTitleSubtitle,
    ApexXAxis,
    ChartComponent,
    NgApexchartsModule,
} from 'ng-apexcharts';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    title: ApexTitleSubtitle;
    stroke: ApexStroke;
};

@Component({
    standalone: true,
    imports: [NgApexchartsModule, MatRadioModule, FormsModule],
    templateUrl: './data-chart.component.html',
    styleUrl: './data-chart.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataChartComponent {
    @ViewChild('tempChart') tempChart!: ChartComponent;
    public tempChartOptions: ChartOptions = {
        series: [],
        chart: {
            height: 350,
            type: 'line',
        },
        xaxis: {
            categories: [],
        },
        dataLabels: {
            enabled: false,
        },
        title: {
            text: '',
        },
        stroke: {
            curve: 'smooth',
        },
    };

    @ViewChild('co2Chart') co2Chart!: ChartComponent;
    public co2ChartOptions: ChartOptions = {
        series: [],
        chart: {
            height: 350,
            type: 'line',
        },
        xaxis: {
            categories: [],
        },
        dataLabels: {
            enabled: false,
        },
        title: {
            text: '',
        },
        stroke: {
            curve: 'smooth',
        },
    };

    public selectedTimeFrame: string = 'lastWeek';

    constructor() {
        this.initCharts();
    }

    onTimeFrameChange(event: any): void {
        const selection = event.value;
        this.updateSeries(selection);
    }

    initCharts(): void {
        let myData = [];
        let xLabels = [];
        if (this.selectedTimeFrame === 'lastWeek') {
            myData = this.getTestWeekData();
            xLabels = this.getTestWeekLabels();
        } else if (this.selectedTimeFrame === 'lastDay') {
            myData = this.getTestDayData();
            xLabels = this.getTestDayLabels();
        } else {
            myData = this.getTestYearData();
            xLabels = this.getTestYearLabels();
        }
        this.tempChartOptions = {
            series: [
                {
                    name: 'Temperature-Series',
                    data: myData,
                    color: '#FF0000',
                },
            ],
            chart: {
                height: 350,
                width: '90%',
                type: 'line',
            },
            title: {
                text: 'Temperature Chart',
            },
            xaxis: {
                categories: xLabels,
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
            },
        };

        this.co2ChartOptions = {
            series: [
                {
                    name: 'CO2-series',
                    data: myData,
                    color: '#FF0000',
                },
            ],
            chart: {
                height: 350,
                width: '90%',
                type: 'line',
            },
            title: {
                text: 'CO2 Emission Chart',
            },
            xaxis: {
                categories: xLabels,
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
            },
        };
    }

    updateCharts(): void {
        const newData = this.tempChartOptions.series[0].data.map((value) =>
            value === null
                ? null
                : (value as number) + Math.floor(Math.random() * 100)
        );
        this.tempChartOptions.series = [
            {
                name: 'Temperature-Series',
                data: newData,
            },
        ];

        const co2Data = this.co2ChartOptions.series[0].data.map((value) =>
            value === null
                ? null
                : (value as number) + Math.floor(Math.random() * 100)
        );
        this.co2ChartOptions.series = [
            {
                name: 'CO2-Series',
                data: co2Data,
            },
        ];
    }

    updateSeries(selection: string): void {
        /*
    const newData = this.chartOptions.series[0].data.map((value) => {
      if (value === null) {
        return value;
      }
      return (value as number) + Math.floor(Math.random() * 100);
    });
    */
        let myData = [];
        let xLabels = [];
        if (this.selectedTimeFrame === 'lastWeek') {
            myData = this.getTestWeekData();
            xLabels = this.getTestWeekLabels();
        } else if (this.selectedTimeFrame === 'lastDay') {
            myData = this.getTestDayData();
            xLabels = this.getTestDayLabels();
        } else {
            myData = this.getTestYearData();
            xLabels = this.getTestYearLabels();
        }
        this.tempChartOptions.series = [
            {
                name: 'Temperature-Series',
                data: myData,
                color: '#FF0000',
            },
        ];
        this.tempChartOptions.xaxis = {
            categories: xLabels,
        };

        this.co2ChartOptions.series = [
            {
                name: 'CO2-Series',
                data: myData,
                color: '#FF0000',
            },
        ];
        this.co2ChartOptions.xaxis = {
            categories: xLabels,
        };
        console.log(selection);
        //this.initCharts();
    }

    updateSeriesWeekly(): void {
        this.tempChartOptions = {
            series: [
                {
                    name: 'Temperature-Series',
                    data:
                        this.selectedTimeFrame === 'lastWeek'
                            ? this.getTestWeekData()
                            : this.getTestYearData(),
                    color: '#FF0000',
                },
            ],
            chart: {
                height: 350,
                width: '50%',
                type: 'line',
            },
            title: {
                text: 'Temperature Chart',
            },
            xaxis: {
                categories:
                    this.selectedTimeFrame === 'lastWeek'
                        ? this.getTestWeekLabels()
                        : this.getTestYearLabels(),
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
            },
        };
    }

    updateSeriesYearly(): void {
        this.co2ChartOptions = {
            series: [
                {
                    name: 'CO2-series',
                    data:
                        this.selectedTimeFrame === 'lastWeek'
                            ? this.getTestWeekData()
                            : this.getTestYearData(),
                    color: '#FF0000',
                },
            ],
            chart: {
                height: 350,
                width: '50%',
                type: 'line',
            },
            title: {
                text: 'CO2 Emission Chart',
            },
            xaxis: {
                categories:
                    this.selectedTimeFrame === 'lastWeek'
                        ? this.getTestWeekLabels()
                        : this.getTestYearLabels(),
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                curve: 'smooth',
            },
        };
    }

    getTestWeekData(): number[] {
        return [14, 56, 45, 23, 12, 56, 89];
    }

    getTestYearData(): number[] {
        return [6, 14, 23, 19, 30, 34, 90, 11, 78, 54, 20, 85];
    }

    getTestDayData(): number[] {
        return [
            20, 34, 12, 30, 18, 27, 39, 41, 21, 45, 86, 53, 38, 76, 45, 67, 54,
            21, 60, 55, 43, 33, 60, 70,
        ];
    }

    getTestWeekLabels(): string[] {
        return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    }

    getTestDayLabels(): string[] {
        return [
            '00:00',
            '01:00',
            '02:00',
            '03:00',
            '04:00',
            '05:00',
            '06:00',
            '07:00',
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
            '17:00',
            '18:00',
            '19:00',
            '20:00',
            '21:00',
            '22:00',
            '23:00',
        ];
    }

    getTestYearLabels(): string[] {
        return [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
    }
}
