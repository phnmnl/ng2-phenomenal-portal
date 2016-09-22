import { Component, OnInit } from '@angular/core';
import { HostListener } from '@angular/core/src/metadata/directives';

declare var gapi: any;
declare var jQuery: any;

@Component({
  selector: 'fl-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  private key: string;

  constructor(
  ) {

  }

  ngOnInit() {

    gapi.analytics.ready(function() {

      jQuery.ajax({url: "http://phenomenal-h2020.eu/portal/api/getGoogleKey.php", success: function(result){

        /**
         * Authorize the user with an access token obtained server side.
         */
        gapi.analytics.auth.authorize({
          'serverAuth': {
            'access_token': result.data['key']
          }
        });

        /**
         * Creates a new DataChart instance showing sessions over the past 30 days.
         * It will be rendered inside an element with the id "chart-1-container".
         */
        var dataChart1 = new gapi.analytics.googleCharts.DataChart({
          query: {
            'ids': 'ga:129019594', // <-- Replace with the ids value for your view.
            'start-date': '30daysAgo',
            'end-date': 'yesterday',
            'metrics': 'ga:sessions,ga:users',
            'dimensions': 'ga:date'
          },
          chart: {
            'container': 'chart-1-container',
            'type': 'LINE',
            'options': {
              'width': '100%'
            }
          }
        });
        dataChart1.execute();


        /**
         * Creates a new DataChart instance showing top 5 most popular demos/tools
         * amongst returning users only.
         * It will be rendered inside an element with the id "chart-3-container".
         */
        var dataChart2 = new gapi.analytics.googleCharts.DataChart({
          query: {
            'ids': 'ga:129019594', // <-- Replace with the ids value for your view.
            'start-date': '30daysAgo',
            'end-date': 'yesterday',
            'metrics': 'ga:sessions',
            'dimensions': 'ga:country',
            'sort': '-ga:sessions',
            'max-results': 7
          },
          chart: {
            'container': 'chart-2-container',
            'type': 'PIE',
            'options': {
              'width': '100%',
              'pieHole': 4/9,
            }
          }
        });
        dataChart2.execute();
      }});


    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.drawChart1();
    this.drawChart2();
  }

  public drawChart1(): void {
    /**
     * Creates a new DataChart instance showing sessions over the past 30 days.
     * It will be rendered inside an element with the id "chart-1-container".
     */
    var dataChart1 = new gapi.analytics.googleCharts.DataChart({
      query: {
        'ids': 'ga:129019594', // <-- Replace with the ids value for your view.
        'start-date': '30daysAgo',
        'end-date': 'yesterday',
        'metrics': 'ga:sessions,ga:users',
        'dimensions': 'ga:date'
      },
      chart: {
        'container': 'chart-1-container',
        'type': 'LINE',
        'options': {
          'width': '100%'
        }
      }
    });
    dataChart1.execute();
  }

  public drawChart2(): void {
    /**
     * Creates a new DataChart instance showing top 5 most popular demos/tools
     * amongst returning users only.
     * It will be rendered inside an element with the id "chart-3-container".
     */
    var dataChart2 = new gapi.analytics.googleCharts.DataChart({
      query: {
        'ids': 'ga:129019594', // <-- Replace with the ids value for your view.
        'start-date': '30daysAgo',
        'end-date': 'yesterday',
        'metrics': 'ga:sessions',
        'dimensions': 'ga:country',
        'sort': '-ga:sessions',
        'max-results': 7
      },
      chart: {
        'container': 'chart-2-container',
        'type': 'PIE',
        'options': {
          'width': '100%',
          'pieHole': 4/9,
        }
      }
    });
    dataChart2.execute();
  }
}
