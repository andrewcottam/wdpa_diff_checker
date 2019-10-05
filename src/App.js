import React from 'react';
import './App.css';
import ReactMapboxGl, { Layer, Source } from 'react-mapbox-gl';
const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiMEZrNzFqRSJ9.0QBRA2HxTb8YHErUFRMPZg"
});
const MAP_STYLE_DEFAULT = "mapbox://styles/mapbox/light-v9";
const INITIAL_CENTER = [-175.15, -21.15];
const INITIAL_ZOOM = [9];
const TILES_BASE_URL = "https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=marxan:";
const SOURCE_NAME_FROM = "wdpa_from";
const SOURCE_NAME_TO = "wdpa_to";
const LAYER_NAME_FROM = "from";
const LAYER_NAME_FROM_DELETED = "from_deleted";
const LAYER_NAME_TO = "to";
const LAYER_NAME_TO_NEW = "to_new";
const LAYER_NAME_TO_CHANGED = "to_changed";
const PAINT_WDPA_DEFAULT = {"fill-color": {"type": "categorical","property": "marine","stops": [["0", "rgb(99,148,69)"],["1", "rgb(63,127,191)"],["2", "rgb(63,127,191)"]]},"fill-outline-color": {"type": "categorical","property": "marine","stops": [["0", "rgb(99,148,69)"],["1", "rgb(63,127,191)"],["2", "rgb(63,127,191)"]]},"fill-opacity": 1};
const PAINT_WDPA_RED = {"fill-color": "rgb(255,0,0)"};
const VERSIONS = ["aug_2019", "sep_2019"];

function App() {
  return (
    // eslint-disable-next-line
    <Map style={MAP_STYLE_DEFAULT} containerStyle={{height: '100vh',width: '100vw'}} center={INITIAL_CENTER}zoom={INITIAL_ZOOM}>
      <Source id={SOURCE_NAME_FROM} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_BASE_URL + "wdpa_" + VERSIONS[0] + "_polygons&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]}}/>
      <Source id={SOURCE_NAME_TO} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: [ TILES_BASE_URL + "wdpa_" + VERSIONS[1] + "_polygons&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]}}/>
      <Layer id={LAYER_NAME_FROM} sourceId={SOURCE_NAME_FROM} type="fill" sourceLayer={"wdpa_" + VERSIONS[0] + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_RED}/>
      <Layer id={LAYER_NAME_FROM_DELETED} sourceId={SOURCE_NAME_FROM} type="fill" sourceLayer={"wdpa_" + VERSIONS[0] + "_polygons"} layout={{visibility: "none"}} paint={PAINT_WDPA_RED}/>
      <Layer id={LAYER_NAME_TO} sourceId={SOURCE_NAME_TO} type="fill" sourceLayer={"wdpa_" + VERSIONS[1] + "_polygons"} layout={{visibility: "visible"}} paint={PAINT_WDPA_DEFAULT}/>
      <Layer id={LAYER_NAME_TO_CHANGED} sourceId={SOURCE_NAME_FROM} type="fill" sourceLayer={"wdpa_" + VERSIONS[0] + "_polygons"} layout={{visibility: "none"}} paint={PAINT_WDPA_RED}/>
      <Layer id={LAYER_NAME_TO_NEW} sourceId={SOURCE_NAME_FROM} type="fill" sourceLayer={"wdpa_" + VERSIONS[0] + "_polygons"} layout={{visibility: "none"}} paint={PAINT_WDPA_RED}/>
    </Map>
  );
}

export default App;
