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

// const REST_BASE_URL = "https://61c92e42cb1042699911c485c38d52ae.vfs.cloud9.eu-west-1.amazonaws.com/python-rest-server/pythonrestserver/services/";
const REST_BASE_URL = "https://dopa-services.jrc.ec.europa.eu/services/marxan_vt/services/";
const USE_SELECTION_COLOR = false; //set to true to disable the selection using the color of the polygon - it will use the P_SELECTION_ colors in MyMap.js
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
      showStatuses: ['added','removed'], 
      view: 'global',
      statuses: [
        {key:"added", text:"Added", short_text:"Added", present: false, visible: true, layers:[window.LYR_TO_NEW_POLYGON, window.LYR_TO_NEW_POINT]},
        {key:"removed", text:"Removed", short_text:"Removed", present: false, visible: true, layers:[window.LYR_FROM_DELETED_POLYGON, window.LYR_FROM_DELETED_POINT]},
        {key:"changed", text:"Attribute", short_text:"Attribute", present: false, visible: true, layers:[window.LYR_TO_CHANGED_ATTRIBUTE]},
        {key:"point_to_polygon", text:"The geometry has changed from a point to a polygon", short_text:"Geometry: pt -> poly", present: false, visible: true, layers:[window.LYR_FROM_GEOMETRY_POINT_TO_POLYGON,window.LYR_TO_GEOMETRY_POINT_TO_POLYGON,window.LYR_TO_GEOMETRY_POINT_TO_POLYGON_LINE]},
        {key:"point_count_changed", text:"The geometry has been modified", short_text:"Geometry: changed", present: false, visible: true, layers:[window.LYR_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE,window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON,window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON_LINE]},
        {key:"geometry_shifted", text:"The geometry has moved", short_text:"Geometry: moved", present: false, visible: true, layers:[window.LYR_FROM_GEOMETRY_SHIFTED_LINE,window.LYR_TO_GEOMETRY_SHIFTED_POLYGON,window.LYR_TO_GEOMETRY_SHIFTED_POLYGON_LINE]},
        {key:"no_change", text:"No change", short_text:"No change", present: false, visible: true, layers:[window.LYR_TO_POLYGON, window.LYR_TO_POINT]},
        ], 
      versions:  [{id:0, title: "August 2019"},{id:1, title: "September 2019", selected: true},{id:2, title:"October 2019"}],
      showChanges: false
    };
    this.mouseOverPAPopup = false;
    this.mouseOverPAPopuplist = false;
    this.PAPopuptimer = []; 
    this.PAPopupListtimer = [];
    this.wdpaidsUnderMouse = [];
  }
  componentDidMount() {
    //get the abbreviated version data
    let _versions = this.state.versions.map(version => {
      return Object.assign(version, {abbreviated: version.title.toLowerCase().substr(0,3) + "_" + version.title.slice(-4), shortTitle: version.title.substr(0,3) + " " + version.title.slice(-2)});
    });
    let selectedVersion = _versions.find(version => version.hasOwnProperty("selected")).id;
    this.setState({versions: _versions}, () => {
      //set the version
      this.setState({fromVersion: this.state.versions[selectedVersion-1], toVersion: this.state.versions[selectedVersion]},() => {
        this.versionChanged();
      });
    });
  }
  //get a pointer to the mapbox gl map
  setMap(map){
    this.map = map;
    //add event handlers to the map
    this.map.on("mousemove", this.mouseMove.bind(this));
    //set the version
    this.versionChanged();
  }
  versionChanged(){
    if (this.state.showChanges){
      //get the global diff summary
      this.getGlobalSummary().then(() => {
        //filter the countries for those that have diff data
        this.getVisibleCountries();
      });
    }else{
      //change the vector tiles and map them
      if (this.map) this.hideChanges();
    }
  }
  hideChanges(){
    this.setState({global_summary: []});  
  }
  getAbbreviatedVersion(fullVersion){
    return fullVersion.toLowerCase().substr(0,3) + "_" + fullVersion.slice(-4);
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
      //get the country statistics in this version
      this._get(REST_BASE_URL + "get_wdpa_diff_global_summary?version=" + this.state.toVersion.id + "&format=json").then(response => {
        let global_summary_all = response.records.map(country => {
          //find the matching item from the countries.json array
          countryData = countriesJson.features.find(feature => feature.properties.iso3 === country.iso3);
          //merge the two objects
          return (countryData) ? Object.assign(country, countryData.properties, { "centroid": countryData.geometry.coordinates }) : null;
        });
        //filter out the nulls
        this.global_summary_all = global_summary_all.filter((item) => !(item === null));
        resolve("GlobalSummaryRetrieved");
      });
    });
  }
  //returns true if the country has protected areas with the passed status
  isCountryVisible(status, country){
    return (this.state.showStatuses.indexOf(status)!==-1)&&(country[status] > 0); 
  }
  //filters the global summary for only the countries that need to be shown based on the statuses that the user wants to see
  getVisibleCountries(){
    if (this.global_summary_all === undefined) return;
    //iterate through the countries and get only the ones that will be shown
    let global_summary = this.global_summary_all.filter((country) => {
      return (this.isCountryVisible('added', country) || this.isCountryVisible('removed', country) || this.isCountryVisible('changed', country));
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
  //iterates through the country summary data and sets a flag in the status array if they are visible
  setStatusPresence(records, iso3){
    let _statuses = this.state.statuses;
    let _presences = records.map(item=>{return item.status});
    _statuses = _statuses.map(status => {
      if (status.key !== "no_change"){
        return Object.assign(status, {present: _presences.indexOf(status.key) !== -1});
      }else{
        //the no_change status is handled differently as we dont want to retrieve all wdpaids for a country which havent changed as this is lots of data, potentially, but we can get the no_change country statistics from the global summary
        let global_summary_data = this.global_summary_all.find(item => { return item.iso3 === iso3});
        let no_change_status = _statuses.find(item => item.key === 'no_change');
        return Object.assign(no_change_status, {present: global_summary_data.no_change > 0});
      }
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
    this._get(REST_BASE_URL + "get_wdpa_diff_country_summary?version=" + this.state.toVersion.id + "&format=json&iso3=" + country.iso3).then(response => {
      //set the visibility of the statuses in the statuses array
      this.setStatusPresence(response.records, country.iso3);
      this.setState({country_summary: response.records});
    });
    //get the individual changes in the protected areas
    this._get(REST_BASE_URL + "get_wdpa_diff_country_diffs?version=" + this.state.toVersion.id + "&format=json&iso3=" + country.iso3).then(response => {
      if (response.records.length>0) this.setState({country_pa_diffs: response.records});
    });
  }
  //gets the features under the cursor 
  mouseMove(e){
    var features = this.map.queryRenderedFeatures(e.point,{layers: [window.LYR_FROM_DELETED_POLYGON, window.LYR_FROM_DELETED_POINT,window.LYR_TO_POLYGON, window.LYR_TO_POINT,window.LYR_TO_CHANGED_ATTRIBUTE, window.LYR_TO_GEOMETRY_POINT_TO_POLYGON,window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON,window.LYR_TO_GEOMETRY_SHIFTED_POLYGON,window.LYR_TO_NEW_POLYGON,window.LYR_TO_NEW_POINT]});
    if (features.length>0) {
      //remove any duplicate features (at the boundary between vector tiles there may be duplicates so remove them)
      features = this.removeDuplicateFeatures(features, "wdpaid");
      //get the unique wdpaids values 
      let wdpaids = features.map(feature => feature.properties.wdpaid);
      //compare the wdpas with the previous features under the mouse to see if there are any differences
      if (!this.arraysAreTheSame(wdpaids,this.wdpaidsUnderMouse)){
        this.onMouseEnter({point: e.point, features: features});
        this.wdpaidsUnderMouse = wdpaids;
      }
    }else{
      //no features under the cursor
      this.clearPopups();
    }
  }
  //gets unique features from an array of features based on the key property
  removeDuplicateFeatures(arr, key){
    let uniqueValues =[], uniqueFeatures = [];
		arr.forEach(feature=>{
			if (uniqueValues.indexOf(feature.properties[key]) === -1){
				uniqueFeatures.push(feature);
				uniqueValues.push(feature.properties[key]);
			}
		});
    return uniqueFeatures;
  }
  //compares two arrays to see if they are the same
  arraysAreTheSame(arr1, arr2){
    //compare using a simple string conversion
    return (arr1.join("") === arr2.join("")) ? true : false;
  }
  onMouseEnter(e){
    if (this.state.view === 'global') return;
    //if only one feature - show the PAPopup
    if (e.features.length === 1) {
      this.closePAPopuplist(0);
      //clear any timers to close the PAPopup
      this.PAPopuptimer.forEach(timer=>{ clearTimeout(timer)});
      this.showPAPopup(e);
    }else{ //show the PAPopuplist
      this.closePAPopup(0);
      //clear any timers to close the PAPopupList
      this.PAPopupListtimer.forEach(timer=>{ clearTimeout(timer)});
      this.showPAPopuplist(e);
    }
  }
  clearPopups(){
    //reset the local variable that has the wdpaids
    this.wdpaidsUnderMouse = [];
    //the PAPopupList is currently shown and we dont want to close it
    if (this.state.dataForPopup && this.state.dataForPopup.features && this.state.dataForPopup.features.length >1) return; 
    //deselect features immediately 
    this.deselectFeatures();
    //close the PAPopup
    this.closePAPopup(400);
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
    this.showPAPopup({features:[feature], point:{x: e.clientX + 50, y: e.clientY}});
  }
  closePAPopup(ms){
    //wait for a bit before closing the popup - the user may want to interact with it
    this.PAPopuptimer.push(setTimeout(()=>{
      if (!this.mouseOverPAPopup) this.setState({dataForPopup: undefined});
    }, ms));  
  }
  closePAPopuplist(ms){
    this.PAPopupListtimer.push(setTimeout(()=>{
      if (!this.mouseOverPAPopuplist) this.setState({dataForPopupList: undefined});
    }, ms));            
  }
  onMouseEnterPAPopup(e){
    this.mouseOverPAPopup = true;
  }
  onMouseLeavePAPopup(e){
    this.mouseOverPAPopup = false;
    //close the PAPopup
    this.closePAPopup(0);
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
        newValue = "rgba(" + rgba.values[0] + "," + rgba.values[1] + "," + rgba.values[2] + "," + this.getNewOpacity(rgba.alpha, increaseBy) + ")";
      }
      //increase the opacity if the key contains the word opacity
      if (key.indexOf("opacity") !== -1) newValue = this.getNewOpacity(paint[key],increaseBy);
      //dont change the fill outline opacity if the source layer is a changed geometry polygon - the fill outline should remain invisible as it will be shown in the geometry changed line layer
      if (!((key === "fill-outline-color") && (sourceLayer === window.LYR_TO_GEOMETRY_POINT_TO_POLYGON || sourceLayer ===  window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON || sourceLayer === window.LYR_TO_GEOMETRY_SHIFTED_POLYGON))) this.map.setPaintProperty(targetLayer, key, newValue);
    });
  }
  getNewOpacity(value, increaseBy){
    return ((value + increaseBy)>1) ? 1 : value + increaseBy;
  }
  getPaintProperty(layerid){
    let style = this.map.getStyle();
    let layer = style.layers.find(layer => { return layer.id === layerid});
    return layer.paint;
  }

  showAllNoChanges(_show){
    let statuses = (_show) ? ['added','removed','changed'] : [];
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
  setVersion(version){
    this.setState({fromVersion: this.state.versions[version-1], toVersion: this.state.versions[version]},() => {
      this.versionChanged();
    });
  }
  setShowChanges(value){
    this.setState({showChanges:value},() => {
      this.versionChanged();
    });
  }
  render() {
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
          view={this.state.view}
          attribution={"IUCN and UNEP-WCMC (2019), The World Database on Protected Areas (WDPA) August, 2019, Cambridge, UK: UNEP-WCMC. Available at: <a href='http://www.protectedplanet.net'>www.protectedplanet.net</a>"}
        />
        <PAPopupList dataForPopupList={this.state.dataForPopupList} country_pa_diffs={this.state.country_pa_diffs} map={this.map} showPAPopup={this.showPAPopupFromList.bind(this)} onMouseEnterPAPopuplist={this.onMouseEnterPAPopuplist.bind(this)} onMouseLeavePAPopuplist={this.onMouseLeavePAPopuplist.bind(this)}/> 
        <PAPopup statuses={this.state.statuses} dataForPopup={this.state.dataForPopup} country_pa_diffs={this.state.country_pa_diffs} map={this.map} fromVersion={this.state.fromVersion} toVersion={this.state.toVersion} onMouseEnterPAPopup={this.onMouseEnterPAPopup.bind(this)} onMouseLeavePAPopup={this.onMouseLeavePAPopup.bind(this)}/>
        <AppBar setVersion={this.setVersion.bind(this)} versions={this.state.versions} version={this.state.toVersion} setShowChanges={this.setShowChanges.bind(this)}/>
        <FooterBar view={this.state.view} statuses={this.state.statuses} handleStatusChange={this.handleStatusChange.bind(this)}/>
      </React.Fragment>
    );
  }
}

export default App;
