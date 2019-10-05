import React from 'react';
import './App.css';
import ReactMapboxGl, { Layer,Source } from 'react-mapbox-gl';
const Map = ReactMapboxGl({
  accessToken: "pk.eyJ1IjoiYmxpc2h0ZW4iLCJhIjoiMEZrNzFqRSJ9.0QBRA2HxTb8YHErUFRMPZg"
});
const INITIAL_CENTER = [-175.15, -21.15];
const INITIAL_ZOOM = [9];

function App() {
  return (
    <Map // eslint-disable-next-line
      style="mapbox://styles/mapbox/light-v9"
      containerStyle={{
        height: '100vh',
        width: '100vw'
      }}
      center={INITIAL_CENTER}
      zoom={INITIAL_ZOOM}
    >
    <Source id={'wdpa'} tileJsonSource={{type: "vector", attribution: "wdpa", tiles: ["https://geospatial.jrc.ec.europa.eu/geoserver/gwc/service/wmts?layer=marxan:wdpa_sep_2019_polygons&tilematrixset=EPSG:900913&Service=WMTS&Request=GetTile&Version=1.0.0&Format=application/x-protobuf;type=mapbox-vector&TileMatrix=EPSG:900913:{z}&TileCol={x}&TileRow={y}"]}}/>
             <Layer 
                id={"wdpa"} 
                sourceId={"wdpa"} 
                type="fill" 
                sourceLayer={"wdpa_sep_2019_polygons"} 
                layout={{visibility: "visible"}}
                paint={{
                    "fill-color": {
                      "type": "categorical",
                      "property": "marine",
                      "stops": [
                        ["0", "rgb(99,148,69)"],
                        ["1", "rgb(63,127,191)"],
                        ["2", "rgb(63,127,191)"]
                      ]
                    },
                    "fill-outline-color": {
                      "type": "categorical",
                      "property": "marine",
                      "stops": [
                        ["0", "rgb(99,148,69)"],
                        ["1", "rgb(63,127,191)"],
                        ["2", "rgb(63,127,191)"]
                      ]
                    },
                    "fill-opacity": 1
                  }}
            /> : null;
    </Map>
  );
}

export default App;
