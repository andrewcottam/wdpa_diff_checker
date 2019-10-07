import React from 'react';
import ReactMapboxGl, { Layer, Source, MapContext  } from 'react-mapbox-gl';
import CountryPopup from './CountryPopup.js';

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiMEZrNzFqRSJ9.0QBRA2HxTb8YHErUFRMPZg"
});

const MAP_STYLE_DEFAULT = "mapbox://styles/mapbox/light-v9";
// const INITIAL_CENTER = [-175.15, -21.15]; 
const INITIAL_CENTER = [0, 0];
const INITIAL_ZOOM = [2];
const TILES_BASE_URL = "https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=marxan:";
const SOURCE_NAME_FROM = "wdpa_from";
const SOURCE_NAME_TO = "wdpa_to";
const LAYER_NAME_FROM = "from";
const LAYER_NAME_FROM_DELETED = "from_deleted";
const LAYER_NAME_TO = "to";
const LAYER_NAME_TO_NEW = "to_new";
const LAYER_NAME_TO_CHANGED = "to_changed";
const LAYER_NAME_TO_LABEL = "to_label";
const PAINT_WDPA_DEFAULT = { "fill-color": { "type": "categorical", "property": "marine", "stops": [["0", "rgba(99,148,69,0.4)"],["1", "rgba(63,127,191,0.4)"],["2", "rgba(63,127,191,0.4)"]] }, "fill-outline-color": { "type": "categorical", "property": "marine", "stops": [["0", "rgb(99,148,69)"],["1", "rgb(63,127,191)"],["2", "rgb(63,127,191)"]] }, "fill-opacity": 0.3 };
const PAINT_WDPA_CHANGED = { "fill-color": "rgb(255,0,255)", "fill-outline-color": "rgb(255,0,255)", "fill-opacity": 0.6};
const PAINT_WDPA_DELETED = { "fill-color": "rgb(255,0,0)", "fill-outline-color": "rgb(255,0,0)"};
const PAINT_WDPA_NEW = { "fill-color": "rgb(0,255,0)", "fill-outline-color": "rgb(0,255,0)", "fill-opacity": 0.6};

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
  showCountryPopups() {
    if (this.props.view === 'global'){
      //restore the country popups
      this.setState({countryPopups: this.countryPopups});
    }
  }
  hideCountryPopups() {
    //hide any popups as they cause the map to lag because they are all rerendered continually
    if (this.props.view === 'global'){
      this.countryPopups = this.state.countryPopups;
      this.setState({ countryPopups:[] });
    }
  }
  clickCountryPopup(country){
    //hide the country popups
    this.hideCountryPopups();
    //set the bounds of the map
    this.setState({bounds: [[country.west, country.south],[country.east,country.north]]});
    this.props.clickCountryPopup(country);
  }
  render() {
    let countryPopups, toFilter;
    switch (this.props.view) {
      case 'global':
        //get the country popups
        let iso3s = [];
        countryPopups = this.props.global_summary_visible.map(country => {
          iso3s.push(country.iso3);
          return <CountryPopup country={country} key={country.iso3} showStatuses={this.props.showStatuses} clickCountryPopup={this.clickCountryPopup.bind(this)}/>;
        });
        //filter the toLayer to only the countries that are being shown
        toFilter = ['all', ['in', 'iso3'].concat(iso3s)];
        break;
      case 'country':
        toFilter = ['all', ['!in', 'wdpaid'].concat(this.props.country_summary.changed).concat(this.props.country_summary.new)];
        break;
      default:
        // code
    }
    return (
      // eslint-disable-next-line
      <Map style={MAP_STYLE_DEFAULT} containerStyle={{height: '100vh',width: '100vw'}} center={INITIAL_CENTER} zoom={INITIAL_ZOOM} onMoveStart={this.hideCountryPopups.bind(this)} onMoveEnd={this.showCountryPopups.bind(this)} fitBounds={this.state.bounds} fitBoundsOptions={{ padding: { top: 10, bottom: 10, left: 10, right: 10 }, easing: (num) => { return 1 }}}>
        <MapContext.Consumer>
          {(map) => {
            this.props.setMap(map);
          }}
        </MapContext.Consumer>
        <Source id={SOURCE_NAME_FROM} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_BASE_URL + "wdpa_" + this.props.fromVersion + "_polygons&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]}}/>
        <Source id={SOURCE_NAME_TO} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_BASE_URL + "wdpa_" + this.props.toVersion + "_polygons&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]}}/>
        <Layer id={LAYER_NAME_FROM} sourceId={SOURCE_NAME_FROM} type="fill" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "none"}} paint={PAINT_WDPA_DEFAULT}/>
        <Layer id={LAYER_NAME_TO} sourceId={SOURCE_NAME_TO} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_DEFAULT} filter={toFilter} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer id={LAYER_NAME_TO_CHANGED} sourceId={SOURCE_NAME_TO} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_CHANGED} filter={['all', ['in', 'wdpaid'].concat(this.props.country_summary.changed)]} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer id={LAYER_NAME_FROM_DELETED} sourceId={SOURCE_NAME_FROM} type="fill" sourceLayer={"wdpa_" + this.props.fromVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_DELETED} filter={['all', ['in', 'wdpaid'].concat(this.props.country_summary.deleted)]} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer id={LAYER_NAME_TO_NEW} sourceId={SOURCE_NAME_TO} type="fill" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_NEW} filter={['all', ['in', 'wdpaid'].concat(this.props.country_summary.new)]} onMouseEnter={this.props.onMouseEnter.bind(this)}/>
        <Layer id={LAYER_NAME_TO_LABEL} sourceId={SOURCE_NAME_TO} type="symbol" sourceLayer={"wdpa_" + this.props.toVersion + "_polygons"} layout={{"visibility": (this.props.view === 'global') ? 'none' : 'visible', "text-field": "{wdpaid}", "text-size": 9}}/>
        {countryPopups}
      </Map>
    );
  }
}

export default MyMap;