import React from 'react';
import ReactMapboxGl, { Layer, Source, MapContext  } from 'react-mapbox-gl';
import CountryPopup from './CountryPopup.js';

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiMEZrNzFqRSJ9.0QBRA2HxTb8YHErUFRMPZg"
});

const MAP_STYLE_DEFAULT = "mapbox://styles/blishten/ck1hsullb06lw1cmyzz7wrycl"; //mapbox light v7 style without the national parks, national park labels or landuse
// const INITIAL_CENTER = [-175.15, -21.15]; 
const INITIAL_CENTER = [0, 0];
const INITIAL_ZOOM = [2];
const TILES_PREFIX = "https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=marxan:";
const TILES_SUFFIX = "&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}";
//source names
const SOURCE_NAME_FROM = "wdpa_from";
const SOURCE_NAME_FROM_POINTS = "wdpa_from_points";
const SOURCE_NAME_TO = "wdpa_to";
//layer names
const LAYER_NAME_FROM = "from";
const LAYER_NAME_FROM_DELETED = "from_deleted";
const LAYER_NAME_FROM_GEOMETRY_SHIFTED = "from_geometry_shifted";
const LAYER_NAME_FROM_GEOMETRY_POINT_COUNT_CHANGED = "from_geometry_point_count_changed";
const LAYER_NAME_FROM_GEOMETRY_POINT_TO_POLYGON = "from_geometry_point_to_polygon";
const LAYER_NAME_TO = "to";
const LAYER_NAME_TO_NEW = "to_new";
const LAYER_NAME_TO_CHANGED = "to_changed";
const LAYER_NAME_TO_LABEL = "to_label";
//paint properties
const PAINT_WDPA_DEFAULT = { "fill-color": { "type": "categorical", "property": "marine", "stops": [["0", "rgba(99,148,69,0.4)"],["1", "rgba(63,127,191,0.4)"],["2", "rgba(63,127,191,0.4)"]] }, "fill-outline-color": { "type": "categorical", "property": "marine", "stops": [["0", "rgb(99,148,69)"],["1", "rgb(63,127,191)"],["2", "rgb(63,127,191)"]] }, "fill-opacity": 0.3 };
const PAINT_WDPA_GEOMETRY_SHIFTED = { "fill-color": "rgba(255,0,0,0)", "fill-outline-color": "rgb(255,0,0)"};
const PAINT_WDPA_GEOMETRY_POINT_COUNT_CHANGED = { "fill-color": "rgba(0,0,0,0)", "fill-outline-color": "rgb(0,0,255)"};
const PAINT_WDPA_GEOMETRY_POINT_TO_POLYGON = {"circle-radius": 10, "circle-color": "rgb(255,0,0)"};
const PAINT_WDPA_CHANGED = { "fill-color": "rgba(255,0,255,0.3)", "fill-outline-color": "rgb(255,0,255)", "fill-opacity": 0.4};
const PAINT_WDPA_DELETED = { "fill-color": "rgba(255,0,0, 0.3)", "fill-outline-color": "rgba(255,0,0, 0.4)"};
const PAINT_WDPA_NEW = { "fill-color": "rgba(89, 62, 187,0.5)", "fill-outline-color": "rgba(89, 62, 187,0.6)", "fill-opacity": 0.6};

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
    let countryPopups, toFilter, newPAs=[], deletedPAs=[], changedPAs=[], geometryShiftedPAs=[], geometryPointCountChangedPAs= [], geometryPointToPolygonPAs = [];
    switch (this.props.view) {
      case 'global':
        //get the country popups
        let iso3s = [];
        countryPopups = this.props.global_summary.map(country => {
          iso3s.push(country.iso3);
          return <CountryPopup country={country} key={country.iso3} showStatuses={this.props.showStatuses} clickCountryPopup={this.clickCountryPopup.bind(this)}/>;
        });
        //filter the toLayer to only the countries that are being shown
        toFilter = ['in', 'iso3'].concat(iso3s);
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
        //filter the toLayer for those PAs not have not changed or are not new
        toFilter = ['all', ['!in', 'wdpaid'].concat(changedPAs).concat(newPAs),['in', 'iso3', this.country.iso3]];
        break;
      default:
        // code
    }
    return (
      // eslint-disable-next-line
      <Map style={MAP_STYLE_DEFAULT} containerStyle={{height: '100vh',width: '100vw'}} center={INITIAL_CENTER} zoom={INITIAL_ZOOM} onMoveStart={this.props.hideCountryPopups} onMoveEnd={this.props.showCountryPopups} fitBounds={this.state.bounds} fitBoundsOptions={{ padding: { top: 10, bottom: 10, left: 10, right: 10 }, easing: (num) => { return 1 }}}>
        <MapContext.Consumer>
          {(map) => {
            this.props.setMap(map);
          }}
        </MapContext.Consumer>
        <Source id={SOURCE_NAME_FROM} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_PREFIX + "wdpa_" + this.props.fromVersion + "_polygons" + TILES_SUFFIX]}}/>
        <Source id={SOURCE_NAME_FROM_POINTS} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_PREFIX + "wdpa_" + this.props.fromVersion + "_points" + TILES_SUFFIX]}}/>
        <Source id={SOURCE_NAME_TO} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_PREFIX + "wdpa_" + this.props.toVersion + "_polygons" + TILES_SUFFIX]}}/>
        <Layer sourceId={SOURCE_NAME_FROM} id={LAYER_NAME_FROM} type="fill" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "none"}} paint={PAINT_WDPA_DEFAULT}/>
        <Layer sourceId={SOURCE_NAME_FROM} id={LAYER_NAME_FROM_GEOMETRY_SHIFTED} type="fill" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "visible"}} filter={['in', 'wdpaid'].concat(geometryShiftedPAs)} paint={PAINT_WDPA_GEOMETRY_SHIFTED}/>
        <Layer sourceId={SOURCE_NAME_FROM} id={LAYER_NAME_FROM_GEOMETRY_POINT_COUNT_CHANGED} type="fill" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "visible"}} filter={['in', 'wdpaid'].concat(geometryPointCountChangedPAs)} paint={PAINT_WDPA_GEOMETRY_POINT_COUNT_CHANGED}/>
        <Layer sourceId={SOURCE_NAME_FROM_POINTS} id={LAYER_NAME_FROM_GEOMETRY_POINT_TO_POLYGON} type="circle" sourceLayer={"wdpa_" + this.props.fromVersion + "_points"} layout={{visibility: "visible"}} filter={['in', 'wdpaid'].concat(geometryPointToPolygonPAs)} paint={PAINT_WDPA_GEOMETRY_POINT_TO_POLYGON}/>
        <Layer sourceId={SOURCE_NAME_TO} id={LAYER_NAME_TO} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_DEFAULT} filter={toFilter} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer sourceId={SOURCE_NAME_TO} id={LAYER_NAME_TO_CHANGED} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_CHANGED} filter={['in', 'wdpaid'].concat(changedPAs)} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer sourceId={SOURCE_NAME_FROM} id={LAYER_NAME_FROM_DELETED} type="fill" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_DELETED} filter={['in', 'wdpaid'].concat(deletedPAs)} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer sourceId={SOURCE_NAME_TO} id={LAYER_NAME_TO_NEW} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_NEW} filter={['in', 'wdpaid'].concat(newPAs)} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer sourceId={SOURCE_NAME_TO} id={LAYER_NAME_TO_LABEL} type="symbol" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{"visibility": (this.props.view === 'global') ? 'none' : 'visible', "text-field": "{wdpaid}", "text-size": 9}} filter={(this.country) ? ['==', 'iso3', 'GBR'] : []}/>
        {countryPopups}
      </Map>
    );
  }
}

export default MyMap;