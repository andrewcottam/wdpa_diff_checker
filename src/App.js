import React from 'react';
import './App.css';
import jsonp from 'jsonp-promise';
import geojson from './countries.json';
import MyMap from './MyMap.js';
import PAPopup from './PAPopup.js';
import PAPopupList from './PAPopupList.js';

const REST_BASE_URL = "https://61c92e42cb1042699911c485c38d52ae.vfs.cloud9.eu-west-1.amazonaws.com/python-rest-server/pythonrestserver/services/";
const VERSIONS = ["aug_2019", "sep_2019"];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      global_summary: [],
      country_summary: [],
      country_pa_diffs: [],
      fromVersion: "", 
      toVersion: "", 
      showStatuses: ['new','deleted'], 
      view: 'global'
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
  //rest request to get the global diff summary
  getGlobalSummary() {
    return new Promise((resolve, reject) => {
      let countryData;
      //get the country reference data from the cached geojson data
      let countriesJson = JSON.parse(JSON.stringify(geojson));
      //get the countries that have changes in this version
      this._get(REST_BASE_URL + "get_wdpa_diff_global_summary?format=json").then(response => {
        let global_summary_all = response.records.map(country => {
          //find the matching item from the countries.json array
          countryData = countriesJson.features.find(feature => feature.properties.iso3 === country.iso3);
          //merge the two objects
          return (countryData) ? Object.assign(country, countryData.properties, { "centroid": countryData.geometry.coordinates }) : null;
        });
        //filter out the nulls
        this.global_summary_all = global_summary_all.filter((item) => item !== null);
        resolve("GlobalSummaryRetrieved");
      });
    });
  }
  //returns true if the country has protected areas with the passed status
  isCountryVisible(status, country){
    return (this.state.showStatuses.indexOf(status)!==-1)&&(country[status] !== null); 
  }
  //filters the global summary for only the countries that need to be shown
  getVisibleCountries(){
    //iterate through the countries and get only the ones that will be shown
    let global_summary = this.global_summary_all.filter((country) => {
      return (this.isCountryVisible('new', country) || this.isCountryVisible('deleted', country) || this.isCountryVisible('changed', country));
    });
    //set the state - this creates the country popups on the map
    this.setState({global_summary: global_summary});
  }
  showCountryPopups() {
    if (this.state.view === 'global') this.getVisibleCountries();
  }
  hideCountryPopups() {
    if (this.state.view === 'global') this.setState({ global_summary:[] });
  }
  //fired when the user clicks on a country popup
  clickCountryPopup(country) {
    //hide the country popups
    this.hideCountryPopups();
    //set the view type
    this.setState({view: "country"});
    //get the country diff summary
    this._get(REST_BASE_URL + "get_wdpa_diff_country_summary?format=json&iso3=" + country.iso3).then(response => {
      this.setState({country_summary: response.records});
    });
    //get the individual changes in the protected areas
    this._get(REST_BASE_URL + "get_wdpa_diff_country_diffs?format=json&iso3=" + country.iso3).then(response => {
      if (response.records.length>0) this.setState({country_pa_diffs: response.records});
    });
  }
  onMouseEnter(e){
    let wdpaids =[];
		//remove duplicate features
		let features = e.features.map(feature=>{
			if (wdpaids.indexOf(feature.properties.wdpaid) === -1){
				wdpaids.push(feature.properties.wdpaid);
				return feature;
			}else{
				return null;
			}
		});
		//remove the nulls
		features = features.filter((item) => item !== null);
		//set the features property back on the mouseEventData
    Object.assign(e, {features: features});
    if (this.state.view === 'country') this.setState({mouseEnterEventData:e});
    //highlight the feature
    if (e.features.length === 1) this.highlightFeature(e.features[0]);
  }
  showPAPopup(feature, e){
    this.onMouseEnter({features:[feature], point:{x: e.screenX, y: e.screenY}});
  }
  highlightFeature(feature){
		switch (feature.layer.id) {
			case window.LYR_TO_CHANGED_GEOMETRY:
	      //the following lines are necessary because if you update the state it refreshes all of the map layers so we access the Mapbox API directly
        this.map.setFilter(window.LYR_FROM_GEOMETRY_SELECTED_LINE, ['==','wdpaid', feature.properties.wdpaid]);
        this.map.setFilter(window.LYR_FROM_GEOMETRY_SELECTED_POINT, ['==','wdpaid', feature.properties.wdpaid]);
        this.map.setFilter(window.LYR_TO_GEOMETRY_SELECTED_LINE, ['==','wdpaid', feature.properties.wdpaid]);
				break;
			default:
				//code
		}
  }
  render() {
    let children = (this.state.mouseEnterEventData !== undefined) ? 
      (this.state.mouseEnterEventData.features.length === 1) ? 
        <PAPopup mouseEnterEventData={this.state.mouseEnterEventData} country_pa_diffs={this.state.country_pa_diffs} map={this.map} fromVersion={this.state.fromVersion} toVersion={this.state.toVersion}/>
        : 
        <PAPopupList mouseEnterEventData={this.state.mouseEnterEventData} country_pa_diffs={this.state.country_pa_diffs} map={this.map} showPAPopup={this.showPAPopup.bind(this)}/> 
      : null;
    return (
      <React.Fragment>
        <MyMap 
          fromVersion={this.state.fromVersion} 
          toVersion={this.state.toVersion}
          global_summary={this.state.global_summary}
          country_summary={this.state.country_summary}
          hideCountryPopups={this.hideCountryPopups.bind(this)}
          showCountryPopups={this.showCountryPopups.bind(this)}
          setMap={this.setMap.bind(this)}
          showStatuses={this.state.showStatuses}
          clickCountryPopup={this.clickCountryPopup.bind(this)}
          onMouseEnter={this.onMouseEnter.bind(this)}
          view={this.state.view}
        />
        {children}
      </React.Fragment>
    );
  }
}

export default App;
