import React from 'react';
import './App.css';
import jsonp from 'jsonp-promise';
import geojson from './countries.json';
import MyMap from './MyMap.js';
import CountryPopup from './CountryPopup.js';
import PAPopupList from './PAPopupList.js';

const REST_BASE_URL = "https://61c92e42cb1042699911c485c38d52ae.vfs.cloud9.eu-west-1.amazonaws.com/python-rest-server/pythonrestserver/services/";
const VERSIONS = ["aug_2019", "sep_2019"];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      showStatuses: ['new','deleted'], 
      fromVersion: "", 
      toVersion: "", 
      view: 'global', 
      countries: [], 
      newFilter: ["==", "wdpaid", -1], 
      deletedFilter: ["==", "wdpaid", -1], 
      changedFilter: ["==", "wdpaid", -1], 
      toFilter: ["!=", "wdpaid", -1]
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
      let countryArray = response.records.map(country => {
        //find the matching item from the countries.json array
        countryData = countriesJson.features.find(feature => feature.properties.iso3 === country.iso3);
        //merge the two objects
        let returnObject = (countryData) ? Object.assign(country, countryData.properties, { "centroid": countryData.geometry.coordinates }) : country;
        return returnObject;
      });
      //get the popups
      this.countryPopups = this.getCountryPopups(countryArray);
      //get the country popups
      this.setState({countryPopups: this.countryPopups});
    });
  }
  getCountryPopups(countryArray){
    //initialise and array to hold all the countries that have popups shown
    let countriesWithPopups = [];
    let countryPopups = countryArray.map(country => {
      //the popup will be visible only if there are values for the requested type, e.g. new, deleted or changed
      let visible = ((this.state.showStatuses.indexOf('new') !==-1)&&(country.new))||((this.state.showStatuses.indexOf('deleted') !==-1)&&(country.deleted))||((this.state.showStatuses.indexOf('changed') !==-1)&&(country.changed));
      //add the country to the array of countries that are being shown
      if (visible) countriesWithPopups.push(country.iso3);
      return (visible && country.centroid) ? <CountryPopup country={country} key={country.iso3} showStatuses={this.state.showStatuses} clickCountryPopup={this.clickCountryPopup.bind(this)}/> : null;
    });
    //see the filter on the toLayer
    this.setState({toFilter: ['all', ['in', 'iso3'].concat(countriesWithPopups)]});
    return countryPopups;
  }
  hideCountryPopups() {
    //hide any popups as they cause the map to lag because they are all rerendered continually
    if (this.state.view === 'global'){
      this.setState({ countryPopups:[] });
    }
  }
  showCountryPopups() {
    if (this.state.view === 'global'){
      //restore the country popups
      this.setState({countryPopups: this.countryPopups});
    }
  }
  clickCountryPopup(country) {
    this.hideCountryPopups();
    //set the view type
    this.setState({view: "country"});
    //set the bounds of the map
    this.setState({country: country, bounds: [[country.west, country.south],[country.east,country.north]]});
    //get the stats data for the country
    this._get(REST_BASE_URL + "get_wdpa_diff_country?format=json&iso3=" + country.iso3).then(response => {
      //iterate through the country data, e.g. new: [1,2,3,4,5], deleted: [6,7,8], changed: [9.10,11]
      if (response.records.length>0){
        let filter, newFilter, deletedFilter, changedFilter, toFilterWDPAs = [];
        response.records.forEach(record => {
          filter = ['all', ['in', 'wdpaid'].concat(record.wdpaids)];
          switch (record.status) {
            case 'new':
              //add the wdpaids to the new filter
              newFilter = filter;
              //add the new wdpas to the filter out in the to WDPA layer
              toFilterWDPAs = toFilterWDPAs.concat(record.wdpaids);
              break;
            case 'deleted':
              deletedFilter = filter;
              break;
            case 'changed':
              changedFilter = filter;
              //add the changed wdpas to the filter out in the to WDPA layer
              toFilterWDPAs = toFilterWDPAs.concat(record.wdpaids);
              break;
            default:
              // code
            }  
          });
          this.setState({newFilter: newFilter, deletedFilter: deletedFilter, changedFilter: changedFilter, toFilter: ['all', ['!in', 'wdpaid'].concat(toFilterWDPAs)]});
      }
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
          hideCountryPopups={this.hideCountryPopups.bind(this)} 
          showCountryPopups={this.showCountryPopups.bind(this)} 
          countryPopups={this.state.countryPopups}
          bounds={this.state.bounds} 
          fromVersion={this.state.fromVersion} 
          toVersion={this.state.toVersion}
          newFilter={this.state.newFilter}
          deletedFilter={this.state.deletedFilter}
          changedFilter={this.state.changedFilter}
          toFilter={this.state.toFilter}
          onMouseEnter={this.onMouseEnter.bind(this)}
          view={this.state.view}
        />
        <PAPopupList mouseEnterEventData={this.state.mouseEnterEventData} protected_areas_data={this.state.protected_areas_data} map={this.state.map}/>
      </React.Fragment>
    );
  }
}

export default App;
