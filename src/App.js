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
      country_summary: [],
      fromVersion: "", 
      toVersion: "", 
      view: 'global', 
    };
  }
  componentDidMount() {
    this.getCountriesWithChanges();
    this.setState({ fromVersion: VERSIONS[0], toVersion: VERSIONS[1] });
  }
  setMap(map, e){
    this.setState({map: map});
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
  getCountriesWithChanges() {
    let countryData;
    //get the country reference data from the cached geojson data
    let countriesJson = JSON.parse(JSON.stringify(geojson));
    //get the countries that have changes in this version
    this._get(REST_BASE_URL + "get_wdpa_diff_countries?format=json").then(response => {
      let global_summary = response.records.map(country => {
        //find the matching item from the countries.json array
        countryData = countriesJson.features.find(feature => feature.properties.iso3 === country.iso3);
        //merge the two objects
        let returnObject = (countryData) ? Object.assign(country, countryData.properties, { "centroid": countryData.geometry.coordinates }) : country;
        return returnObject;
      });
      this.setState({global_summary: global_summary});
    });
  }
  clickCountryPopup(country) {
    //set the view type
    this.setState({view: "country"});
    //get the stats data for the country
    this._get(REST_BASE_URL + "get_wdpa_diff_country?format=json&iso3=" + country.iso3).then(response => {
      this.setState({country_summary: response.records});
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
          setMap={this.setMap.bind(this)}
          showStatuses={this.state.showStatuses}
          global_summary={this.state.global_summary}
          country_summary={this.state.country_summary}
          clickCountryPopup={this.clickCountryPopup.bind(this)}
          fromVersion={this.state.fromVersion} 
          toVersion={this.state.toVersion}
          onMouseEnter={this.onMouseEnter.bind(this)}
          view={this.state.view}
        />
        <PAPopupList mouseEnterEventData={this.state.mouseEnterEventData} protected_areas_data={this.state.protected_areas_data} map={this.state.map}/>
      </React.Fragment>
    );
  }
}

export default App;
