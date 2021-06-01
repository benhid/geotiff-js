import React, { useState } from "react";

import { MapContainer, TileLayer } from "react-leaflet";

import geoblaze from "geoblaze";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import chroma from "chroma-js";

const Map = ({ center, zoom, min, max, noDataValue }) => {
  const [map, setMap] = useState();

  // map opts
  const [mapCenter, setMapCenter] = useState(center || { lat: -33, lng: 147 });
  const [mapZoom, setMapZoom] = useState(zoom || 6);
  const [mapTheme, setMapTheme] = useState("RdYlBu");

  // layer opts
  const [activeLayer, setActiveLayer] = useState();
  const layerNoDataValue = noDataValue || 0;
  const [layerOpacity, setLayerOpacity] = useState(0.7);
  const [activeLayerMin, setActiveLayerMin] = useState();
  const [activeLayerMax, setActiveLayerMax] = useState();
  const [layerMin, setLayerMin] = useState(min);
  const [layerMax, setLayerMax] = useState(max);

  // geotiff
  const [geotiff, setGeotiff] = useState("/wind_speed_usa.tif");

  /*
  Remove active layer from map.
  */
  const clearActiveLayer = () => {
    if (activeLayer) {
      console.log("deleting active layer")
      map.removeLayer(activeLayer);
    }
  }

  /*
  Load geotiff raster from URL or file.
  */
  const loadGeotiff = () => {
    console.log("loading geotiff")

    geotiff &&
      geoblaze
        .load(geotiff)
        .then(georaster => {
          const min = layerMin || georaster.mins[0];
          const max = layerMax || georaster.maxs[0];
          const range = max - min; // georaster.ranges[0];

          setActiveLayerMin(min);
          setActiveLayerMax(max);

          console.log("min value " + min + ", max value " + max);

          // available color scales can be found by running console.log(chroma.brewer);
          const scale = chroma.scale(mapTheme);

          const colorFn = bands => {
            const pixelValues = bands[0]; // !!! there's just one band in this raster

            // don't return a color
            if (pixelValues === layerNoDataValue) return null;

            // scale to 0-1 used by chroma
            const scaledPixelValue = (pixelValues - min) / range;

            const color = scale(scaledPixelValue).hex();

            return color;
          };

          const layer = new GeoRasterLayer({
            georaster: georaster,
            opacity: layerOpacity,
            pixelValuesToColorFn: colorFn,
            resolution: 64 // optional parameter for adjusting display resolution
          });

          // restore map
          clearActiveLayer();

          // add new layer
          layer.addTo(map);
          setActiveLayer(layer);

          map.fitBounds(layer.getBounds());
        });
  };

  return (
    <>
      <div>
        <select onChange={(e) => setGeotiff(e.target.value)}>
          <option value="/wind_speed_usa.tif">wind_speed_usa.tif</option>
          <option value="https://danwild.github.io/leaflet-geotiff-2/wind_speed.tif">wind_speed.tif</option>
          <option value="/LC08_L1TP_045032_20180811_20180815_01_T1_B5.TIF">LC08_L1TP.tif</option>
        </select>
        <select onChange={(e) => setMapTheme(e.target.value)}>
          <option value="RdYlBu">RdYlBu</option>
          <option value="greys">Greys</option>
          <option value="viridis">Viridis</option>
        </select>
        <input type="number" placeholder="opacity" value={layerOpacity} step="0.1" min="0.0" max="1.0" onChange={(e) => setLayerOpacity(e.target.value)} />
        <input type="number" placeholder="min" onChange={(e) => setLayerMin(e.target.value)} />
        <input type="number" placeholder="max" onChange={(e) => setLayerMax(e.target.value)} />
      </div>
      <div>
        <button onClick={() => loadGeotiff()}>load</button>
      </div>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={false}
        whenCreated={setMap}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </>
  );
};

export default Map;
