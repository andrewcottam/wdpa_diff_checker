import React from 'react';
import CountryPopup from './CountryPopup.js';
import mapboxgl from 'mapbox-gl';

// const INITIAL_CENTER = [-175.15, -21.15]; 
const INITIAL_CENTER = [0, 0];
const INITIAL_ZOOM = [2];
const TILES_PREFIX = "https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=marxan:";
const TILES_SUFFIX = "&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}";
//paint properties
const P_FROM_GEOMETRY_SHIFTED_LINE = { "line-color": "rgb(255,0,0)", "line-width": 1, "line-opacity": 0.5, "line-dasharray": [3,3]};
const P_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE = { "line-color": "rgb(255,0,0)", "line-width": 1, "line-opacity": 0.5, "line-dasharray": [3,3]};
const P_FROM_GEOMETRY_POINT_TO_POLYGON = {"circle-radius": 3, "circle-color": "rgb(255,0,0)", "circle-opacity": 0.5};
const P_FROM_DELETED_POLYGON = { "fill-color": "rgba(255,0,0, 0.2)", "fill-outline-color": "rgba(255,0,0,0.5)"};
const P_FROM_DELETED_POINT = {"circle-radius": 5, "circle-color": "rgb(255,0,0)", "circle-opacity": 0.6};
const P_TO_CHANGED_ATTRIBUTE = { "fill-color": "rgba(99,148,69,0.4)", "fill-outline-color": "rgba(99,148,69,0.8)"};
const P_TO_CHANGED_GEOMETRY = { "fill-color": "rgba(99,148,69,0.2)", "fill-outline-color": "rgba(0,0,0,0)"};
const P_TO_CHANGED_GEOMETRY_LINE = { "line-color": "rgb(99,148,69)", "line-width": 2, "line-opacity": 0.6, "line-dasharray": [3,3]};
const P_TO_NEW_POLYGON = { "fill-color": "rgba(63,127,191,0.2)", "fill-outline-color": "rgba(63,127,191,0.6)"};
const P_TO_NEW_POINT = {"circle-radius": 10, "circle-color": "rgb(63,127,191)", "circle-opacity": 0.6};
const P_TO_POLYGON = { "fill-color": "rgba(99,148,69,0.2)", "fill-outline-color": "rgba(99,148,69,0.3)"};
const P_TO_POINT = {"circle-radius": 5, "circle-color": "rgb(99,148,69)", "circle-opacity": 0};
const P_SELECTED_POINT = {"circle-radius": 5, "circle-color": "rgb(0,0,0)", "circle-opacity": 0};
const P_SELECTED_LINE = { "line-color": "rgb(0,0,0)", "line-width": 2, "line-opacity": 0};
const P_SELECTED_POLYGON = { "fill-color": "rgba(0,0,0,0)", "fill-outline-color": "rgba(255,0,0,0)"};

class MyMap extends React.Component {
  constructor(props){
    super(props);
    this.state = {
    };
  }
  componentDidMount(){
    //instantiate the map
    mapboxgl.accessToken = 'pk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiMEZrNzFqRSJ9.0QBRA2HxTb8YHErUFRMPZg';
    this.map = new mapboxgl.Map({
      container: 'map',
      style: window.MAP_STYLE_DEFAULT,
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });
    //set a property in the App class
    this.props.setMap(this.map);
    this.map.on("styledata", this.styleLoaded.bind(this));
    this.map.on("movestart", this.hideCountryPopups);
    this.map.on("moveend", this.showCountryPopups);
  }
  clickCountryPopup(country){
    //set the currently selected country
    this.props.clickCountryPopup(country);
  }
  //called when the maps style has loaded
  styleLoaded(map){
    //add the sources
    let _from = (this.props.fromVersion === undefined) ? undefined : this.props.fromVersion.abbreviated;
    let _to = this.props.toVersion.abbreviated;
    this.addRemoveSource({id: window.SRC_FROM_POLYGONS, tileJsonSource: {type: "vector", attribution: this.props.attribution, tiles: [ TILES_PREFIX + "wdpa_" + _from + "_polygons" + TILES_SUFFIX]}}, false);
    this.addRemoveSource({id: window.SRC_FROM_POINTS, tileJsonSource: {type: "vector", tiles: [ TILES_PREFIX + "wdpa_" + _from + "_points" + TILES_SUFFIX]}}, false);
    //initialise the layers
    this.initialiseLayers();
  }
  addRemoveSource(details, remove){
    //if the layer already exists then delete it
    if (this.map.getSource(details.id)) this.map.removeSource(details.id);
    if (!(remove)){
      console.log("Adding source: " + details.id);
      this.map.addSource({
        'id': details.id,
        'tileJsonSource': details.tileJsonSource,
      });
    }
  }
  //adds the dynamic layers and filters them by country
  initialiseLayers(){
    //add the dynamic layers
    this.addDynamicLayers(this.props.fromVersion === undefined);
    //filter the to points and polygons layer - if no countries are passed then show all countries
    if (this.iso3s.length === 0){
      this.map.setFilter(window.LYR_TO_POLYGON, null);
    }else{
      this.map.setFilter(window.LYR_TO_POLYGON, ['in', 'iso3'].concat(this.iso3s));  
    }
  }
  //adds or removes the map layers - if toOnly is passed as true it will remove all of the from layers
  addDynamicLayers(toOnly){
    //add dynamic layers
    let _from = (this.props.fromVersion !== undefined) ? this.props.fromVersion.abbreviated : "";
    let _to = this.props.toVersion.abbreviated;
    //removed protected areas layers
    this.addRemoveLayer({id: window.LYR_FROM_DELETED_POLYGON, sourceId: window.SRC_FROM_POLYGONS, type: "fill", sourceLayer: "wdpa_" + _from + "_polygons", layout: {visibility: "visible"}, paint: P_FROM_DELETED_POLYGON, filter:['==', 'wdpaid','-1']}, toOnly);
    this.addRemoveLayer({id: window.LYR_FROM_DELETED_POINT, sourceId: window.SRC_FROM_POINTS, type: "circle", sourceLayer: "wdpa_" + _from + "_points", layout: {visibility: "visible"}, paint: P_FROM_DELETED_POINT, filter:['==', 'wdpaid','-1']}, toOnly);
    //no change protected areas layers
    this.addRemoveLayer({id: window.LYR_TO_POLYGON, sourceId: window.SRC_TO_POLYGONS, type: "fill", sourceLayer: "wdpa_" + _to + "_polygons", layout: {visibility: "visible"}, paint: P_TO_POLYGON, filter:['==', 'wdpaid','-1']});
    this.addRemoveLayer({id: window.LYR_TO_POINT, sourceId: window.SRC_TO_POINTS, type: "circle", sourceLayer: "wdpa_" + _to + "_points", layout: {visibility: "visible"}, paint: P_TO_POINT, filter:['==', 'wdpaid','-1']});
    //attribute change in protected areas layers
    this.addRemoveLayer({id: window.LYR_TO_CHANGED_ATTRIBUTE, sourceId: window.SRC_TO_POLYGONS, type: "fill", sourceLayer: "wdpa_" + _to + "_polygons", layout: {visibility: "visible"}, paint: P_TO_CHANGED_ATTRIBUTE, filter:['==', 'wdpaid','-1']});
    //geometry change in protected areas layers - from
    this.addRemoveLayer({id: window.LYR_FROM_GEOMETRY_POINT_TO_POLYGON, sourceId: window.SRC_FROM_POINTS, type: "circle", sourceLayer: "wdpa_" + _from + "_points", layout: {visibility: "visible"}, paint: P_FROM_GEOMETRY_POINT_TO_POLYGON, filter:['==', 'wdpaid','-1']}, toOnly);
    this.addRemoveLayer({id: window.LYR_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE, sourceId: window.SRC_FROM_POLYGONS, type: "line", sourceLayer: "wdpa_" + _from + "_polygons", layout: {visibility: "visible"}, paint: P_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE, filter:['==', 'wdpaid','-1']}, toOnly);
    this.addRemoveLayer({id: window.LYR_FROM_GEOMETRY_SHIFTED_LINE, sourceId: window.SRC_FROM_POLYGONS, type: "line", sourceLayer: "wdpa_" + _from + "_polygons", layout: {visibility: "visible"}, paint: P_FROM_GEOMETRY_SHIFTED_LINE, filter:['==', 'wdpaid','-1']}, toOnly);
    //geometry change in protected areas layers - to
    this.addRemoveLayer({id: window.LYR_TO_GEOMETRY_POINT_TO_POLYGON, sourceId: window.SRC_TO_POLYGONS, type: "fill", sourceLayer: "wdpa_" + _to + "_polygons", layout: {visibility: "visible"}, paint: P_TO_CHANGED_GEOMETRY, filter:['==', 'wdpaid','-1']});
    this.addRemoveLayer({id: window.LYR_TO_GEOMETRY_POINT_TO_POLYGON_LINE, sourceId: window.SRC_TO_POLYGONS, type: "line", sourceLayer: "wdpa_" + _to + "_polygons", layout: {visibility: "visible"}, paint: P_TO_CHANGED_GEOMETRY_LINE, filter:['==', 'wdpaid','-1']});
    this.addRemoveLayer({id: window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON, sourceId: window.SRC_TO_POLYGONS, type: "fill", sourceLayer: "wdpa_" + _to + "_polygons", layout: {visibility: "visible"}, paint: P_TO_CHANGED_GEOMETRY, filter:['==', 'wdpaid','-1']});
    this.addRemoveLayer({id: window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON_LINE, sourceId: window.SRC_TO_POLYGONS, type: "line", sourceLayer: "wdpa_" + _to + "_polygons", layout: {visibility: "visible"}, paint: P_TO_CHANGED_GEOMETRY_LINE, filter:['==', 'wdpaid','-1']});
    this.addRemoveLayer({id: window.LYR_TO_GEOMETRY_SHIFTED_POLYGON, sourceId: window.SRC_TO_POLYGONS, type: "fill", sourceLayer: "wdpa_" + _to + "_polygons", layout: {visibility: "visible"}, paint: P_TO_CHANGED_GEOMETRY, filter:['==', 'wdpaid','-1']});
    this.addRemoveLayer({id: window.LYR_TO_GEOMETRY_SHIFTED_POLYGON_LINE, sourceId: window.SRC_TO_POLYGONS, type: "line", sourceLayer: "wdpa_" + _to + "_polygons", layout: {visibility: "visible"}, paint: P_TO_CHANGED_GEOMETRY_LINE, filter:['==', 'wdpaid','-1']});
    //added protected areas layers
    this.addRemoveLayer({id: window.LYR_TO_NEW_POLYGON, sourceId: window.SRC_TO_POLYGONS, type: "fill", sourceLayer: "wdpa_" + _to + "_polygons", layout: {visibility: "visible"}, paint: P_TO_NEW_POLYGON, filter:['==', 'wdpaid','-1']});
    this.addRemoveLayer({id: window.LYR_TO_NEW_POINT, sourceId: window.SRC_TO_POINTS, type: "circle", sourceLayer: "wdpa_" + _to + "_points", layout: {visibility: "visible"}, paint: P_TO_NEW_POINT, filter:['==', 'wdpaid','-1']});
    //selection layers
    this.addRemoveLayer({id: window.LYR_FROM_SELECTED_POLYGON, sourceId: window.SRC_FROM_POLYGONS, type: "fill", sourceLayer: "wdpa_" + _from + "_polygons", layout: {visibility: "visible"}, paint: P_SELECTED_POLYGON, filter:['==', 'wdpaid','-1']}, toOnly);
    this.addRemoveLayer({id: window.LYR_FROM_SELECTED_LINE, sourceId: window.SRC_FROM_POLYGONS, type: "line", sourceLayer: "wdpa_" + _from + "_polygons", layout: {visibility: "visible"}, paint: P_SELECTED_LINE, filter:['==', 'wdpaid','-1']}, toOnly);
    this.addRemoveLayer({id: window.LYR_FROM_SELECTED_POINT, sourceId: window.SRC_FROM_POINTS, type: "circle", sourceLayer: "wdpa_" + _from + "_points", layout: {visibility: "visible"}, paint: P_SELECTED_POINT, filter:['==', 'wdpaid','-1']}, toOnly);
    this.addRemoveLayer({id: window.LYR_TO_SELECTED_POLYGON, sourceId: window.SRC_TO_POLYGONS, type: "fill", sourceLayer: "wdpa_" + _to + "_polygons", layout: {visibility: "visible"}, paint: P_SELECTED_POLYGON, filter:['==', 'wdpaid','-1']});
    this.addRemoveLayer({id: window.LYR_TO_SELECTED_LINE, sourceId: window.SRC_TO_POLYGONS, type: "line", sourceLayer: "wdpa_" + _to + "_polygons", layout: {visibility: "visible"}, paint: P_SELECTED_LINE, filter:['==', 'wdpaid','-1']});
    this.addRemoveLayer({id: window.LYR_TO_SELECTED_POINT, sourceId: window.SRC_TO_POINTS, type: "circle", sourceLayer: "wdpa_" + _to + "_points", layout: {visibility: "visible"}, paint: P_SELECTED_POINT, filter:['==', 'wdpaid','-1']});
  }
  //adds or removes an individual layer to the map
  addRemoveLayer(details, remove = false){
    //if the layer already exists then delete it
    if (this.map.getLayer(details.id)) this.map.removeLayer(details.id);
    if (!(remove)){
      console.log("Adding layer: " + details.id);
      this.map.addLayer({
        'id': details.id,
        'type': details.type,
        'source': details.sourceId,
        'source-layer': details.sourceLayer,
        'paint': details.paint,
        'filter': details.filter
      });
    }
  }
  doStuff(){
    if ((this.props.toVersion === undefined) || (this.map === undefined)) return null;
    //get the from and to versions in abbreviated form to get the vector tiles
    let _from = (this.props.fromVersion === undefined) ? undefined : this.props.fromVersion.abbreviated;
    if (_from){ //dynamically add the from sources
      this.addRemoveSource({id: window.SRC_FROM_POLYGONS, tileJsonSource: {type: "vector", attribution: this.props.attribution, tiles: [ TILES_PREFIX + "wdpa_" + _from + "_polygons" + TILES_SUFFIX]}}, false);
      this.addRemoveSource({id: window.SRC_FROM_POINTS, tileJsonSource: {type: "vector", tiles: [ TILES_PREFIX + "wdpa_" + _from + "_points" + TILES_SUFFIX]}}, false);
    }
    let _to = this.props.toVersion.abbreviated;
    let countryPopups, toPolygonsFilter, toPointsFilter = [], addedPAs=[], removedPAs=[], changedPAs=[], geometryShiftedPAs=[], geometryPointCountChangedPAs= [], geometryPointToPolygonPAs = [], geometryChangedPAs =[];
    switch (this.props.view) {
      case 'global':
        //get the country popups
        this.iso3s = [];
        countryPopups = this.props.global_summary.map(country => {
          this.iso3s.push(country.iso3);
          return <CountryPopup country={country} key={country.iso3} showStatuses={this.props.showStatuses} clickCountryPopup={this.clickCountryPopup.bind(this)}/>;
        });
        if ((this.map !== undefined) && (this.map.styleLoaded)) this.initialiseLayers();
        break;
      case 'country':
        if (_from){
          //get the layers to show
          let visibleLayers = this.props.statuses.map(status => {return (status.visible) ? status.key : null});
          //get the stats data for the country
          this.props.country_summary.forEach(record => {
            switch (record.status) {
              case 'added':
                if (visibleLayers.indexOf("added") !== -1) addedPAs = record.wdpaids;
                break;
              case 'removed':
                if (visibleLayers.indexOf("removed") !== -1) removedPAs = record.wdpaids;
                break;
              case 'changed':
                if (visibleLayers.indexOf("changed") !== -1) changedPAs = record.wdpaids;
                break;
              case 'geometry_shifted':
                if (visibleLayers.indexOf("changed") !== -1) geometryShiftedPAs = record.wdpaids;
                break;
              case 'point_count_changed':
                if (visibleLayers.indexOf("changed") !== -1) geometryPointCountChangedPAs = record.wdpaids;
                break;
              case 'point_to_polygon':
                if (visibleLayers.indexOf("changed") !== -1) geometryPointToPolygonPAs = record.wdpaids;
                break;
              default:
                // code
              }
          });
          //get the array of all protected areas that have changed geometries
          geometryChangedPAs = geometryShiftedPAs.concat(geometryPointCountChangedPAs).concat(geometryPointToPolygonPAs);
          //the toLayer should exclude all of the other protected areas that are changed, added or have their geometry shifted
          toPolygonsFilter = ['all', ['!in', 'wdpaid'].concat(changedPAs).concat(addedPAs).concat(geometryChangedPAs),['in', 'iso3', this.props.country.iso3]];
          //the toPoints layer should exclude all new point PAs (which will be shown in blue)
          toPointsFilter = ['all', ['!in', 'wdpaid'].concat(addedPAs),['in', 'iso3', this.props.country.iso3]];        
          //the changed layer should exclude all of the other protected areas that have had their geometry changed - these will be rendered with dashed outlines
          changedPAs = changedPAs.filter(item => !geometryChangedPAs.includes(item));
          //set the filters on the individual layers
          if (_from) { //we are showing changes
            this.map.setFilter(window.LYR_FROM_DELETED_POLYGON,['in', 'wdpaid'].concat(removedPAs));
            this.map.setFilter(window.LYR_FROM_DELETED_POINT, ['in', 'wdpaid'].concat(removedPAs));
            this.map.setFilter(window.LYR_FROM_GEOMETRY_POINT_TO_POLYGON, ['in', 'wdpaid'].concat(geometryPointToPolygonPAs));
            this.map.setFilter(window.LYR_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE, ['in', 'wdpaid'].concat(geometryPointCountChangedPAs));
            this.map.setFilter(window.LYR_FROM_GEOMETRY_SHIFTED_LINE, ['in', 'wdpaid'].concat(geometryShiftedPAs));
          }
          this.map.setFilter(window.LYR_TO_POLYGON, toPolygonsFilter);
          this.map.setFilter(window.LYR_TO_POINT, toPointsFilter);
          this.map.setFilter(window.LYR_TO_CHANGED_ATTRIBUTE, ['in', 'wdpaid'].concat(changedPAs));
          this.map.setFilter(window.LYR_TO_GEOMETRY_POINT_TO_POLYGON, ['in', 'wdpaid'].concat(geometryPointToPolygonPAs));
          this.map.setFilter(window.LYR_TO_GEOMETRY_POINT_TO_POLYGON_LINE, ['in', 'wdpaid'].concat(geometryPointToPolygonPAs));
          this.map.setFilter(window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON, ['in', 'wdpaid'].concat(geometryPointCountChangedPAs));
          this.map.setFilter(window.LYR_TO_GEOMETRY_POINT_COUNT_CHANGED_POLYGON_LINE, ['in', 'wdpaid'].concat(geometryPointCountChangedPAs));
          this.map.setFilter(window.LYR_TO_GEOMETRY_SHIFTED_POLYGON, ['in', 'wdpaid'].concat(geometryShiftedPAs));
          this.map.setFilter(window.LYR_TO_GEOMETRY_SHIFTED_POLYGON_LINE, ['in', 'wdpaid'].concat(geometryShiftedPAs));
          this.map.setFilter(window.LYR_TO_NEW_POLYGON, ['in', 'wdpaid'].concat(addedPAs));
          this.map.setFilter(window.LYR_TO_NEW_POINT, ['in', 'wdpaid'].concat(addedPAs));
        }else{
          this.initialiseLayers();
        }
        break;
      default:
        // code
    }    
  }
  render() {
    this.doStuff();
    return (
      <div id='map' style={{width:'100%',height:'100%',position:'absolute'}}></div>
    );
  }
}

export default MyMap;