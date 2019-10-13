import React from 'react';
import './App.css';
import jsonp from 'jsonp-promise';
import geojson from './countries.json';
import MyMap from './MyMap.js';
import PAPopup from './PAPopup.js';
import PAPopupList from './PAPopupList.js';
import parse from 'color-parse';
import AppBar from './AppBar.js';
import FooterBar from './FooterBar.js';

const REST_BASE_URL = "https://61c92e42cb1042699911c485c38d52ae.vfs.cloud9.eu-west-1.amazonaws.com/python-rest-server/pythonrestserver/services/";
// const REST_BASE_URL = "https://rest-services.jrc.ec.europa.eu/services/marxan_vt/services/";
const USE_SELECTION_COLOR = false; //set to true to disable the selection using the color of the polygon - it will use the P_SELECTION_ colors in MyMap.js
let versions = [{title: "August 2019"},{title: "September 2019"}];
//defines which layers will be highlighted when the mouse moves over the source layer - each layer in the highlight layers will be highlighted using the paint properties from the paintPropertyFrom layer
let hightlightRules = [
  {sourceLayer: window.LYR_TO_NEW_POLYGON, highlightLayers: [{ layer: window.LYR_TO_SELECTED_POLYGON, paintPropertyFrom: window.LYR_TO_NEW_POLYGON}]},
  {sourceLayer: window.LYR_TO_NEW_POINT, highlightLayers: [{ layer: window.LYR_TO_SELECTED_POINT, paintPropertyFrom: window.LYR_TO_NEW_POINT}]},
  {sourceLayer: window.LYR_FROM_DELETED_POLYGON, highlightLayers: [{layer: window.LYR_FROM_SELECTED_POLYGON, paintPropertyFrom: window.LYR_FROM_DELETED_POLYGON}]},
  {sourceLayer: window.LYR_FROM_DELETED_POINT, highlightLayers: [{ layer: window.LYR_FROM_SELECTED_POINT, paintPropertyFrom: window.LYR_FROM_DELETED_POINT}]},
  {sourceLayer: window.LYR_TO_CHANGED_ATTRIBUTE, highlightLayers: [{layer: window.LYR_TO_SELECTED_POLYGON, paintPropertyFrom: window.LYR_TO_CHANGED_ATTRIBUTE}]},
  {sourceLayer: window.LYR_TO_GEOMETRY_POINT_TO_POLYGON, highlightLayers: [{layer: window.LYR_FROM_SELECTED_POINT, paintPropertyFrom: window.LYR_FROM_GEOMETRY_POINT_TO_POLYGON},{layer: window.LYR_TO_SELECTED_POLYGON, paintPropertyFrom: window.LYR_TO_GEOMETRY_POINT_TO_POLYGON},{layer: window.LYR_TO_SELECTED_LINE, paintPropertyFrom: window.LYR_TO_GEOMETRY_POINT_TO_POLYGON_LINE}]},
  {sourceLayer: window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON, highlightLayers: [{layer: window.LYR_FROM_SELECTED_LINE, paintPropertyFrom: window.LYR_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE},{layer: window.LYR_TO_SELECTED_POLYGON, paintPropertyFrom: window.LYR_TO_GEOMETRY_POINT_TO_POLYGON},{layer: window.LYR_TO_SELECTED_LINE, paintPropertyFrom: window.LYR_TO_GEOMETRY_POINT_TO_POLYGON_LINE}]},
  {sourceLayer: window.LYR_TO_GEOMETRY_SHIFTED_POLYGON, highlightLayers: [{layer: window.LYR_FROM_SELECTED_LINE, paintPropertyFrom: window.LYR_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE},{layer: window.LYR_TO_SELECTED_POLYGON, paintPropertyFrom: window.LYR_TO_GEOMETRY_POINT_TO_POLYGON},{layer: window.LYR_TO_SELECTED_LINE, paintPropertyFrom: window.LYR_TO_GEOMETRY_POINT_TO_POLYGON_LINE}]},
  {sourceLayer: window.LYR_TO_POLYGON, highlightLayers: [{ layer: window.LYR_TO_SELECTED_POLYGON, paintPropertyFrom: window.LYR_TO_POLYGON},{ layer: window.LYR_FROM_SELECTED_POINT, paintPropertyFrom: window.LYR_FROM_GEOMETRY_POINT_TO_POLYGON}]},
  {sourceLayer: window.LYR_TO_POINT, highlightLayers: [{ layer: window.LYR_TO_SELECTED_POINT, paintPropertyFrom: window.LYR_TO_POINT}]}
];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      global_summary: [],
      country_summary: [],
      country_pa_diffs: [],
      showStatuses: ['new','deleted'], 
      view: 'global',
      statuses: [
        {key:"new", text:"Added", short_text:"Added", present: false, visible: true, layers:[window.LYR_TO_NEW_POLYGON, window.LYR_TO_NEW_POINT]},
        {key:"deleted", text:"Removed", short_text:"Removed", present: false, visible: true, layers:[window.LYR_FROM_DELETED_POLYGON, window.LYR_FROM_DELETED_POINT]},
        {key:"changed", text:"Attribute", short_text:"Attribute", present: false, visible: true, layers:[window.LYR_TO_CHANGED_ATTRIBUTE]},
        {key:"point to polygon", text:"The geometry has changed from a point to a polygon", short_text:"Geometry: pt -> poly", present: false, visible: true, layers:[window.LYR_FROM_GEOMETRY_POINT_TO_POLYGON,window.LYR_TO_GEOMETRY_POINT_TO_POLYGON,window.LYR_TO_GEOMETRY_POINT_TO_POLYGON_LINE]},
        {key:"point count", text:"The geometry has been modified", short_text:"Geometry: changed", present: false, visible: true, layers:[window.LYR_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE,window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON,window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON_LINE]},
        {key:"geometry shifted", text:"The geometry has moved", short_text:"Geometry: moved", present: false, visible: true, layers:[window.LYR_FROM_GEOMETRY_SHIFTED_LINE,window.LYR_TO_GEOMETRY_SHIFTED_POLYGON,window.LYR_TO_GEOMETRY_SHIFTED_POLYGON_LINE]},
        ]
    };
    this.mouseOverPAPopup = false;
    this.mouseOverPAPopuplist = false;
  }
  componentDidMount() {
    //get the abbreviated version data
    versions = versions.map(version => {
      return Object.assign(version, {abbreviated: version.title.toLowerCase().substr(0,3) + "_" + version.title.slice(-4)});
    });
    //set the version
    this.setState({fromVersion: versions[0], toVersion: versions[1]});
    //get the global diff summary
    this.getGlobalSummary().then(() => {
      //filter the countries for those that have diff data
      this.getVisibleCountries();
    });
  }
  getAbbreviatedVersion(fullVersion){
    return fullVersion.toLowerCase().substr(0,3) + "_" + fullVersion.slice(-4);
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
  setStatusPresence(records){
    let _statuses = this.state.statuses;
    let _presences = records.map(item=>{return item.status});
    _statuses = _statuses.map(status => {
      return Object.assign(status, {present: _presences.indexOf(status.key) !== -1});
    });
    this.setState({statuses: _statuses});
  }
  handleStatusChange(e){
    let _statuses = this.state.statuses;
    _statuses = _statuses.map(status => {
      return Object.assign(status, {visible: (status.key === e.key) ? !status.visible : status.visible});
    });
    this.setState({statuses: _statuses});
    //set the layer(s) visibility directly on the map (to avoid an update of the map state)  
    e.layers.forEach(layer => {
      this.map.setLayoutProperty(layer, "visibility", (e.visible) ? "visible" : "none" );
    });
  }
  //fired when the user clicks on a country popup
  clickCountryPopup(country) {
    //set the bounds of the map
    this.map.fitBounds([[country.west, country.south],[country.east,country.north]],{ padding: { top: 10, bottom: 10, left: 10, right: 10 }, easing: (num) => { return 1 }});
    //hide the country popups
    this.hideCountryPopups();
    //set the view type
    this.setState({view: "country"});
    //get the country diff summary
    this._get(REST_BASE_URL + "get_wdpa_diff_country_summary?format=json&iso3=" + country.iso3).then(response => {
      //set the visibility of the statuses in the statuses array
      this.setStatusPresence(response.records);
      this.setState({country_summary: response.records});
    });
    //get the individual changes in the protected areas
    this._get(REST_BASE_URL + "get_wdpa_diff_country_diffs?format=json&iso3=" + country.iso3).then(response => {
      if (response.records.length>0) this.setState({country_pa_diffs: response.records});
    });
  }
  onMouseEnter(e){
    if (this.state.view === 'global') return;
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
    //if only one feature - show the PAPopup
    if (e.features.length === 1) {
      this.showPAPopup(e);
    }else{ //show the PAPopuplist
      this.showPAPopuplist(e);
    }
  }
  onMouseLeave(e){
    //the PAPopupList is currently shown and we dont want to close it
    if (this.state.dataForPopup && this.state.dataForPopup.features && this.state.dataForPopup.features.length >1) return; 
    //deselect features immediately unless the mouse is now over the PAPopup
    this.deselectFeatures();
    //close the PAPopup
    this.closePAPopup(600);
  }
  showPAPopup(e){
    //highlight the feature
    this.highlightFeature(e.features[0]);
    //set the data for the popup
    this.setState({dataForPopup:e});
  }
  showPAPopuplist(e){
    //set the data for the popuplist
    this.setState({dataForPopupList:e});
  }
  showPAPopupFromList(feature,  e){
    this.showPAPopup({features:[feature], point:{x: e.screenX, y: e.screenY}});
  }
  closePAPopup(ms){
    //wait for a bit before closing the popup - the user may want to interact with it
    this.PAPopuptimer = setTimeout(()=>{
      if (!this.mouseOverPAPopup) this.setState({dataForPopup: undefined});
    }, ms);            
  }
  closePAPopuplist(ms){
    this.PAPopupListtimer = setTimeout(()=>{
      if (!this.mouseOverPAPopuplist) this.setState({dataForPopupList: undefined});
    }, ms);            
  }
  onMouseEnterPAPopup(e){
    this.mouseOverPAPopup = true;
  }
  onMouseLeavePAPopup(e){
    this.mouseOverPAPopup = false;
    //close the PAPopup
    this.closePAPopup(600);
  }
  onMouseEnterPAPopuplist(e){
    this.mouseOverPAPopuplist = true;
  }
  onMouseLeavePAPopuplist(e){
    this.mouseOverPAPopuplist = false;
    //close the PAPopup
    this.closePAPopuplist(0);
  }
  highlightFeature(feature){
    //reset the selected layers
    this.deselectFeatures();
    //get the rule for the layer  
    let rule = hightlightRules.find(_rule => _rule.sourceLayer === feature.layer.id);
    //iterate through the layers that need to be highlighted
    rule.highlightLayers.forEach((item) => {
      //set the filter on the highlightLayers
      this.map.setFilter(item.layer, ['==','wdpaid', feature.properties.wdpaid]);
      //increase the opacity
      if (!USE_SELECTION_COLOR) this.increaseOpacity(item.paintPropertyFrom, item.layer);
    });
  }
  //deselects all features 
  deselectFeatures(){
    this.map.setFilter(window.LYR_FROM_SELECTED_POINT, ['==','wdpaid', '-1']);              
    this.map.setFilter(window.LYR_FROM_SELECTED_LINE, ['==','wdpaid', '-1']);              
    this.map.setFilter(window.LYR_FROM_SELECTED_POLYGON, ['==','wdpaid', '-1']);              
    this.map.setFilter(window.LYR_TO_SELECTED_POINT, ['==','wdpaid', '-1']);              
    this.map.setFilter(window.LYR_TO_SELECTED_LINE, ['==','wdpaid', '-1']);              
    this.map.setFilter(window.LYR_TO_SELECTED_POLYGON, ['==','wdpaid', '-1']);
    //reset the selection color in the LYR_TO_SELECTED_POLYGON layer - too slow fades in slowly
    // this.map.setPaintProperty(window.LYR_TO_SELECTED_POLYGON, "fill-color", "rgba(0,0,0,0)");
  }
  //gets the paint property from the passed source layer, clones it into the target layer but with an increase in opacity
  increaseOpacity(sourceLayer, targetLayer, increaseBy = 0.1){
    //get the paint property of the source layer
    let paint = this.getPaintProperty(sourceLayer);
    //iterate through the paint properties of the source layer and copy them to the target layer
    Object.keys(paint).forEach(key=>{
      let newValue = paint[key];
      //increase the opacity in any rgba values
      if ((typeof(paint[key]) === "string") && paint[key].indexOf("rgba") !== -1){
        let rgba = parse(paint[key]);
        newValue = "rgba(" + rgba.values[0] + "," + rgba.values[1] + "," + rgba.values[2] + "," + (rgba.alpha + increaseBy) + ")";
      }
      //increase the opacity if the key contains the word opacity
      if (key.indexOf("opacity") !== -1) newValue = (paint[key] + increaseBy);
      this.map.setPaintProperty(targetLayer, key, newValue);
    });
    
    // 
  }
  getPaintProperty(layerid){
      let style = this.map.getStyle();
      let layer = style.layers.find(layer => { return layer.id === layerid});
      return layer.paint;
  }

  showAllNoChanges(_show){
    let statuses = (_show) ? ['new','deleted','changed'] : [];
    this.showChanges(statuses);
  }
  showChangesWithStatus(status, _show){
    let statuses = this.state.showStatuses;
    if (_show){
      statuses.push(status);  
    }else{
      statuses.pop(status);
    }
    this.showChanges(statuses);
  }
  showChanges(statuses){
    this.setState({showStatuses: statuses},() =>{
      this.getVisibleCountries();  
    });
  }
  render() {
    //clear any timers to close the PAPopup
    clearTimeout(this.PAPopuptimer);
    clearTimeout(this.PAPopupListtimer);
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
          statuses={this.state.statuses}
          clickCountryPopup={this.clickCountryPopup.bind(this)}
          onMouseEnter={this.onMouseEnter.bind(this)}
          onMouseLeave={this.onMouseLeave.bind(this)}
          view={this.state.view}
          attribution={"IUCN and UNEP-WCMC (2019), The World Database on Protected Areas (WDPA) August, 2019, Cambridge, UK: UNEP-WCMC. Available at: <a href='http://www.protectedplanet.net'>www.protectedplanet.net</a>"}
        />
        <PAPopupList dataForPopupList={this.state.dataForPopupList} country_pa_diffs={this.state.country_pa_diffs} map={this.map} showPAPopup={this.showPAPopupFromList.bind(this)} onMouseEnterPAPopuplist={this.onMouseEnterPAPopuplist.bind(this)} onMouseLeavePAPopuplist={this.onMouseLeavePAPopuplist.bind(this)}/> 
        <PAPopup statuses={this.state.statuses} dataForPopup={this.state.dataForPopup} country_pa_diffs={this.state.country_pa_diffs} map={this.map} fromVersion={this.state.fromVersion} toVersion={this.state.toVersion} onMouseEnterPAPopup={this.onMouseEnterPAPopup.bind(this)} onMouseLeavePAPopup={this.onMouseLeavePAPopup.bind(this)}/>
        <AppBar fromVersion={this.state.fromVersion} toVersion={this.state.toVersion} />
        <FooterBar statuses={this.state.statuses} handleStatusChange={this.handleStatusChange.bind(this)}/>
      </React.Fragment>
    );
  }
}

export default App;
