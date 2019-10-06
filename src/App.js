import React from 'react';
import './App.css';
import jsonp from 'jsonp-promise';
import geojson from './countries.json';
import ReactMapboxGl, { Layer, Source, GeoJSONLayer } from 'react-mapbox-gl';
import CountryPopup from './CountryPopup.js';

const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiMEZrNzFqRSJ9.0QBRA2HxTb8YHErUFRMPZg"
});
const MAP_STYLE_DEFAULT = "mapbox://styles/mapbox/light-v9";
// const INITIAL_CENTER = [-175.15, -21.15]; 
const INITIAL_CENTER = [0, 0];
const INITIAL_ZOOM = [2];
const TILES_BASE_URL = "https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=marxan:";
const REST_BASE_URL = "https://61c92e42cb1042699911c485c38d52ae.vfs.cloud9.eu-west-1.amazonaws.com/python-rest-server/pythonrestserver/services/";
const SOURCE_NAME_FROM = "wdpa_from";
const SOURCE_NAME_TO = "wdpa_to";
const LAYER_NAME_FROM = "from";
const LAYER_NAME_FROM_DELETED = "from_deleted";
const LAYER_NAME_TO = "to";
const LAYER_NAME_TO_NEW = "to_new";
const LAYER_NAME_TO_CHANGED = "to_changed";
const PAINT_WDPA_DEFAULT = { "fill-color": { "type": "categorical", "property": "marine", "stops": [
      ["0", "rgb(99,148,69)"],
      ["1", "rgb(63,127,191)"],
      ["2", "rgb(63,127,191)"]
    ] }, "fill-outline-color": { "type": "categorical", "property": "marine", "stops": [
      ["0", "rgb(99,148,69)"],
      ["1", "rgb(63,127,191)"],
      ["2", "rgb(63,127,191)"]
    ] }, "fill-opacity": 1 };
const PAINT_WDPA_RED = { "fill-color": "rgb(255,0,0)" };
const VERSIONS = ["aug_2019", "sep_2019"];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fromVersion: "", toVersion: "", countries: []};
  }
  componentDidMount() {
    this.getCountries();
    this.setState({ fromVersion: VERSIONS[0], toVersion: VERSIONS[1] });
  }
  mapMoveStart() {
    //hide any popups as they cause the map to lag because they are all rerendered continually
    this._countries = this.state.countries;
    this.setState({ countries: [] });
  }
  mapMoveEnd() {
    //restore the country popups
    this.setState({ countries: this._countries });
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
  getCountries() {
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
      //join the information on which countries have had changes to the wdpa to the countries.json data
      this.setState({ countries: countryArray.slice(0, 100) });
    });
  }
  clickCountryPopup(country) {
    this.setState({country: country});
  }
  render() {
    let countryPopups = this.state.countries.map(country => {
      return (country.centroid) ? <CountryPopup country={country} key={country.iso3} clickCountryPopup={this.clickCountryPopup.bind(this)}/> : null;
    });
    return (
      //[[this.state.country.west,this.state.country.south],[this.state.country.east,this.state.country.north]]
      // eslint-disable-next-line
      <Map style={MAP_STYLE_DEFAULT} containerStyle={{height: '100vh',width: '100vw'}} center={INITIAL_CENTER} zoom={INITIAL_ZOOM} onMoveStart={this.mapMoveStart.bind(this)} onMoveEnd={this.mapMoveEnd.bind(this)}>
        <Source id={SOURCE_NAME_FROM} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_BASE_URL + "wdpa_" + this.state.fromVersion + "_polygons&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]}}/>
        <Source id={SOURCE_NAME_TO} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_BASE_URL + "wdpa_" + this.state.toVersion + "_polygons&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]}}/>
        <Layer id={LAYER_NAME_FROM} sourceId={SOURCE_NAME_FROM} type="fill" sourceLayer={"wdpa_" + this.state.fromVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_RED}/>
        <Layer id={LAYER_NAME_FROM_DELETED} sourceId={SOURCE_NAME_FROM} type="fill" sourceLayer={"wdpa_" + this.state.fromVersion + "_polygons"} layout={{visibility: "none"}} paint={PAINT_WDPA_RED}/>
        <Layer id={LAYER_NAME_TO} sourceId={SOURCE_NAME_TO} type="fill" sourceLayer={"wdpa_" + this.state.toVersion + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_DEFAULT}/>
        <Layer id={LAYER_NAME_TO_CHANGED} sourceId={SOURCE_NAME_FROM} type="fill" sourceLayer={"wdpa_" + this.state.fromVersion + "_polygons"} layout={{visibility: "none"}} paint={PAINT_WDPA_RED}/>
        <Layer id={LAYER_NAME_TO_NEW} sourceId={SOURCE_NAME_FROM} type="fill" sourceLayer={"wdpa_" + this.state.fromVersion + "_polygons"} layout={{visibility: "none"}} paint={PAINT_WDPA_RED}/>
        <GeoJSONLayer data={geojson}
          symbolLayout={{
            "text-field": "{name}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
          }}/>        
        {countryPopups}
      </Map>
    );
  }
}

export default App;
