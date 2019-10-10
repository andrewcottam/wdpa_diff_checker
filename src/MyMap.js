import React from 'react';
import ReactMapboxGl, { Layer, Source, MapContext  } from 'react-mapbox-gl';
import CountryPopup from './CountryPopup.js';

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiMEZrNzFqRSJ9.0QBRA2HxTb8YHErUFRMPZg"
});

// const INITIAL_CENTER = [-175.15, -21.15]; 
const INITIAL_CENTER = [0, 0];
const INITIAL_ZOOM = [2];
const TILES_PREFIX = "https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=marxan:";
const TILES_SUFFIX = "&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}";
//paint properties
const P_FROM_GEOMETRY_SHIFTED_LINE = { "line-color": "rgb(99,148,69)", "line-width": 1, "line-opacity": 0.6, "line-dasharray": [3,3]};
const P_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE = { "line-color": "rgb(99,148,69)", "line-width": 1, "line-opacity": 0.6, "line-dasharray": [3,3]};
const P_FROM_GEOMETRY_POINT_TO_POLYGON = {"circle-radius": 5, "circle-color": "rgba(99,148,69,0.6)"};
const P_FROM_GEOMETRY_SELECTED_POINT = {"circle-radius": 5, "circle-color": "rgb(0,0,0)", "circle-opacity": 0};
const P_FROM_GEOMETRY_SELECTED_LINE = { "line-color": "rgb(0,0,0)", "line-width": 1, "line-opacity": 0};
const P_FROM_DELETED_POLYGON = { "fill-color": "rgba(255,0,0, 0.2)", "fill-outline-color": "rgba(255,0,0,0.5)"};
const P_FROM_DELETED_POINT = {"circle-radius": 5, "circle-color": "rgb(255,0,0)", "circle-opacity": 0.6};
const P_TO_CHANGED_ATTRIBUTE = { "fill-color": "rgba(99,148,69,0.4)", "fill-outline-color": "rgba(99,148,69,0.8)"};
const P_TO_CHANGED_GEOMETRY = { "fill-color": "rgba(99,148,69,0.2)", "fill-outline-color": "rgba(0,0,0,0)"};
const P_TO_CHANGED_GEOMETRY_LINE = { "line-color": "rgb(99,148,69)", "line-width": 2, "line-opacity": 0.6, "line-dasharray": [3,3]};
const P_TO_NEW = { "fill-color": "rgba(63,127,191,0.2)", "fill-outline-color": "rgba(63,127,191,0.6)"};
const P_TO_NEW_POINT = {"circle-radius": 10, "circle-color": "rgb(63,127,191)", "circle-opacity": 0.6};
const P_TO = { "fill-color": "rgba(99,148,69,0.2)", "fill-outline-color": "rgba(99,148,69,0.3)"};
const P_TO_POINT = {"circle-radius": 5, "circle-color": "rgb(99,148,69)", "circle-opacity": 0};
const P_TO_GEOMETRY_SELECTED_LINE = { "line-color": "rgb(0,0,0)", "line-width": 1, "line-opacity": 0};
const P_TO_GEOMETRY_SELECTED_POINT = {"circle-radius": 5, "circle-color": "rgb(0,0,0)", "circle-opacity": 0};

const redline={ "line-color": "rgb(255,0,0)", "line-width": 2, "line-opacity": 1};
const redpoint = {"circle-radius": 5, "circle-color": "rgb(255,0,0)", "circle-opacity": 1};

class MyMap extends React.Component {
  constructor(props){
    super(props);
    this.state = {
    };
  }
  shouldComponentUpdate(nextProps, nextState) {
    //this is a crude hack to compare properties -TODO SORT THIS OUT
    return (JSON.stringify(this.props) !== JSON.stringify(nextProps))||(JSON.stringify(this.state) !== JSON.stringify(nextState)); 
  }	
  clickCountryPopup(country){
    //set the bounds of the map
    this.setState({bounds: [[country.west, country.south],[country.east,country.north]]});
    //set the currently selected country
    this.country = country;
    this.props.clickCountryPopup(country);
  }
  render() {
    let countryPopups, toFilter, toPointsFilter = [], newPAs=[], deletedPAs=[], changedPAs=[], geometryShiftedPAs=[], geometryPointCountChangedPAs= [], geometryPointToPolygonPAs = [], geometryChangedPAs =[];
    switch (this.props.view) {
      case 'global':
        //get the country popups
        let iso3s = [];
        countryPopups = this.props.global_summary.map(country => {
          iso3s.push(country.iso3);
          return <CountryPopup country={country} key={country.iso3} showStatuses={this.props.showStatuses} clickCountryPopup={this.clickCountryPopup.bind(this)}/>;
        });
        //filter the toLayer  to only the countries that are being shown
        toFilter = ['in', 'iso3'].concat(iso3s);
        //filter out all points at the global scale view
        toPointsFilter = ['in', 'iso3',''];
        break;
      case 'country':
        //get the stats data for the country
        this.props.country_summary.forEach(record => {
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
            case 'geometry shifted':
              geometryShiftedPAs = record.wdpaids;
              break;
            case 'point count':
              geometryPointCountChangedPAs = record.wdpaids;
              break;
            case 'point to polygon':
              geometryPointToPolygonPAs = record.wdpaids;
              break;
            default:
              // code
            }
        });
        //get the array of all protected areas that have changed geometries
        geometryChangedPAs = geometryShiftedPAs.concat(geometryPointCountChangedPAs).concat(geometryPointToPolygonPAs);
        //the toLayer should exclude all of the other protected areas that are changed, new or have their geometry shifted
        toFilter = ['all', ['!in', 'wdpaid'].concat(changedPAs).concat(newPAs).concat(geometryChangedPAs),['in', 'iso3', this.country.iso3]];
        //the toPoints layer should exclude all new point PAs (which will be shown in blue)
        toPointsFilter = ['all', ['!in', 'wdpaid'].concat(newPAs),['in', 'iso3', this.country.iso3]];        
        //the changed layer should exclude all of the other protected areas that have had their geometry shifted - these will be rendered with dashed outlines
        changedPAs = changedPAs.filter(item => !geometryChangedPAs.includes(item));
        break;
      default:
        // code
    }
    return (
      // eslint-disable-next-line
      <Map style={window.MAP_STYLE_DEFAULT} containerStyle={{height: '100vh',width: '100vw'}} center={INITIAL_CENTER} zoom={INITIAL_ZOOM} onMoveStart={this.props.hideCountryPopups} onMoveEnd={this.props.showCountryPopups} fitBounds={this.state.bounds} fitBoundsOptions={{ padding: { top: 10, bottom: 10, left: 10, right: 10 }, easing: (num) => { return 1 }}}>
        <MapContext.Consumer>
          {(map) => {
            this.props.setMap(map);
          }}
        </MapContext.Consumer>
        <Source id={window.SRC_FROM} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_PREFIX + "wdpa_" + this.props.fromVersion + "_polygons" + TILES_SUFFIX]}}/>
        <Source id={window.SRC_FROM_POINTS} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_PREFIX + "wdpa_" + this.props.fromVersion + "_points" + TILES_SUFFIX]}}/>
        <Source id={window.SRC_TO} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_PREFIX + "wdpa_" + this.props.toVersion + "_polygons" + TILES_SUFFIX]}}/>
        <Source id={window.SRC_TO_POINTS} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_PREFIX + "wdpa_" + this.props.toVersion + "_points" + TILES_SUFFIX]}}/> 
        <Layer sourceId={window.SRC_FROM} id={window.LYR_FROM} type="fill" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "none"}} paint={P_TO}/>
        <Layer sourceId={window.SRC_FROM} id={window.LYR_FROM_GEOMETRY_SHIFTED_LINE} type="line" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "visible"}} filter={['in', 'wdpaid'].concat(geometryShiftedPAs)} paint={P_FROM_GEOMETRY_SHIFTED_LINE}/>
        <Layer sourceId={window.SRC_FROM} id={window.LYR_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE} type="line" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "visible"}} filter={['in', 'wdpaid'].concat(geometryPointCountChangedPAs)} paint={P_FROM_GEOMETRY_POINT_COUNT_CHANGED_LINE}/>
        <Layer sourceId={window.SRC_FROM_POINTS} id={window.LYR_FROM_GEOMETRY_POINT_TO_POLYGON} type="circle" sourceLayer={"wdpa_" + this.props.fromVersion + "_points"} layout={{visibility: "visible"}} filter={['in', 'wdpaid'].concat(geometryPointToPolygonPAs)} paint={P_FROM_GEOMETRY_POINT_TO_POLYGON}/>
        <Layer sourceId={window.SRC_FROM_POINTS} id={window.LYR_FROM_DELETED_POINT} type="circle" sourceLayer={"wdpa_" + this.props.fromVersion + "_points"} layout={{visibility: "visible"}} filter={['in', 'wdpaid'].concat(deletedPAs)} paint={P_FROM_DELETED_POINT} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer sourceId={window.SRC_TO} id={window.LYR_TO_POLYGON} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={P_TO} filter={toFilter} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer sourceId={window.SRC_TO} id={window.LYR_TO_CHANGED_ATTRIBUTE} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_CHANGED_ATTRIBUTE} filter={['in', 'wdpaid'].concat(changedPAs)} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer sourceId={window.SRC_TO} id={window.LYR_TO_CHANGED_GEOMETRY} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_CHANGED_GEOMETRY} filter={['in', 'wdpaid'].concat(geometryChangedPAs)} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer sourceId={window.SRC_TO} id={window.LYR_TO_CHANGED_GEOMETRY_LINE} type="line" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_CHANGED_GEOMETRY_LINE} filter={['in', 'wdpaid'].concat(geometryChangedPAs)}/>
        <Layer sourceId={window.SRC_FROM} id={window.LYR_FROM_DELETED_POLYGON} type="fill" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "visible"}} paint={P_FROM_DELETED_POLYGON} filter={['in', 'wdpaid'].concat(deletedPAs)} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer sourceId={window.SRC_TO} id={window.LYR_TO_NEW_POLYGON} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={P_TO_NEW} filter={['in', 'wdpaid'].concat(newPAs)} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer sourceId={window.SRC_TO_POINTS} id={window.LYR_TO_NEW_POINT} type="circle" sourceLayer={"wdpa_" + this.props.toVersion + "_points"} layout={{visibility: "visible"}} paint={P_TO_NEW_POINT} filter={['in', 'wdpaid'].concat(newPAs)} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer sourceId={window.SRC_TO_POINTS} id={window.LYR_TO_POINT} type="circle" sourceLayer={"wdpa_" + this.props.toVersion + "_points"} layout={{visibility: "visible"}} paint={P_TO_POINT} filter={toPointsFilter} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer sourceId={window.SRC_FROM} id={window.LYR_FROM_GEOMETRY_SELECTED_LINE} type="line" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "visible"}} filter={['==','wdpaid','-1']} paint={redline}/>
        <Layer sourceId={window.SRC_FROM_POINTS} id={window.LYR_FROM_GEOMETRY_SELECTED_POINT} type="circle" sourceLayer={"wdpa_" + this.props.fromVersion + "_points"} layout={{visibility: "visible"}} filter={['==', 'wdpaid','-1']} paint={redpoint}/>
        <Layer sourceId={window.SRC_TO} id={window.LYR_TO_GEOMETRY_SELECTED_LINE} type="line" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={redline} filter={['==', 'wdpaid','-1']}/>
        <Layer sourceId={window.SRC_TO} id={window.LYR_TO_GEOMETRY_SELECTED_POINT} type="line" sourceLayer={"wdpa_" + this.props.toVersion + "_points"} layout={{visibility: "visible"}} paint={redline} filter={['==', 'wdpaid','-1']}/>
        {countryPopups}
      </Map>
    );
  }
}

export default MyMap;