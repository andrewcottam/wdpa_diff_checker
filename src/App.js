import React from 'react';
import './App.css';
import jsonp from 'jsonp-promise';
import geojson from './countries.json';
import MyMap from './MyMap.js';
import PAPopupList from './PAPopupList.js';

const REST_BASE_URL = "https://61c92e42cb1042699911c485c38d52ae.vfs.cloud9.eu-west-1.amazonaws.com/python-rest-server/pythonrestserver/services/";
const VERSIONS = ["aug_2019", "sep_2019"];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      showStatuses: ['new','deleted'], 
      global_summary_visible: [],
      country_summary: {'new':[], deleted:[],changed:[]},
      fromVersion: "", 
      toVersion: "", 
      view: 'global', 
    };
  }
  componentDidMount() {
    this.setState({ fromVersion: VERSIONS[0], toVersion: VERSIONS[1] });
    //get the global diff summary
    this.getGlobalSummary().then(() => {
      //filter the countries for those that have diff data
      this.getVisibleCountries();
    });
  }
  setMap(map){
    this.map = map;
  }
  //makes a GET request and returns a promise which will either be resolved (passing the response) or rejected (passing the error)
  _get(url, params) {
    return new Promise((resolve, reject) => {
      //set the global loading flag
      jsonp(url).promise.then((response) => {
        resolve(response);
      }, (err) => {
        reject(err);
      });
    });
  }
  //returns true if the country has protected areas with the passed status
  showCountry(status, country){
    return (this.state.showStatuses.indexOf(status)!==-1)&&(country[status] !== null); 
  }
  //rest request to get the global diff statistics
  getGlobalSummary() {
    return new Promise((resolve, reject) => {
      let countryData;
      //get the country reference data from the cached geojson data
      let countriesJson = JSON.parse(JSON.stringify(geojson));
      //get the countries that have changes in this version
      this._get(REST_BASE_URL + "get_wdpa_diff_countries?format=json").then(response => {
        let global_summary = response.records.map(country => {
          //find the matching item from the countries.json array
          countryData = countriesJson.features.find(feature => feature.properties.iso3 === country.iso3);
          //merge the two objects
          return (countryData) ? Object.assign(country, countryData.properties, { "centroid": countryData.geometry.coordinates }) : null;
        });
        //filter out the nulls
        this.global_summary = global_summary.filter((item) => item !== null);
        resolve("GlobalSummaryRetrieved");
      });
    });
  }
  //filters the global summary for only the countries that need to be shown
  getVisibleCountries(){
    //iterate through the countries and get only the ones that will be shown
    let global_summary_visible = this.global_summary.filter((country) => {
      return (this.showCountry('new', country) || this.showCountry('deleted', country) || this.showCountry('changed', country));
    });
    //set the state - this creates the country popups on the map
    this.setState({global_summary_visible: global_summary_visible});
  }
  //fired when the user clicks on a country popup
  clickCountryPopup(country) {
    //set the view type
    this.setState({view: "country"});
    //get the stats data for the country
    let newPAs=[], deletedPAs=[], changedPAs=[];
    this._get(REST_BASE_URL + "get_wdpa_diff_country?format=json&iso3=" + country.iso3).then(response => {
      response.records.forEach(record => {
        switch (record.status) {
          case 'new':
            newPAs = record.wdpaids;
            break;
          case 'deleted':
            deletedPAs = record.wdpaids;
            break;
          case 'changed':
            changedPAs = record.wdpaids;
            break;
          default:
            // code
          }
      });
      this.setState({country_summary: {'new': newPAs, deleted: deletedPAs, changed: changedPAs}});
    });
    //get the individual changes in the protected areas
    this._get(REST_BASE_URL + "get_wdpa_diff_pas?format=json&iso3=" + country.iso3).then(response => {
      if (response.records.length>0) this.setState({protected_areas_data: response.records});
    });
  }
  onMouseEnter(e){
    this.setState({mouseEnterEventData:e});
  }
  render() {
    return (
      <React.Fragment>
        <MyMap 
          fromVersion={this.state.fromVersion} 
          toVersion={this.state.toVersion}
          global_summary_visible={this.state.global_summary_visible}
          country_summary={this.state.country_summary}
          setMap={this.setMap.bind(this)}
          showStatuses={this.state.showStatuses}
          clickCountryPopup={this.clickCountryPopup.bind(this)}
          onMouseEnter={this.onMouseEnter.bind(this)}
          view={this.state.view}
        />
        <PAPopupList mouseEnterEventData={this.state.mouseEnterEventData} protected_areas_data={this.state.protected_areas_data} map={this.map}/>
      </React.Fragment>
    );
  }
}

export default App;
