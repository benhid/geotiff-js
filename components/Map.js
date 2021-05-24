import React, { useState, useEffect } from "react";

import { MapContainer, TileLayer, LayersControl } from "react-leaflet";

import geoblaze from "geoblaze";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import chroma from "chroma-js";

const Map = ({ center, zoom }) => {
  const [map, setMap] = useState();
  const [mapCenter, setMapCenter] = useState(center || { lat: -33, lng: 147 });
  const [mapZoom, setMapZoom] = useState(zoom || 6);
  const [mapTheme, setMapTheme] = useState("Viridis");
  const [geotiff, setGeotiff] = useState();
  const [activeLayer, setActiveLayer] = useState();

  const clearActiveLayer = () => {
    activeLayer && map.removeLayer(activeLayer);
  }

  const loadGeotiff = () => {
    geotiff &&
      geoblaze
        .load(geotiff)
        .then(georaster => {
          const min = georaster.mins[0];
          const range = georaster.ranges[0];

          // available color scales can be found by running console.log(chroma.brewer);
          const scale = chroma.scale(mapTheme);

          const colorFn = bands => {
            const pixelValues = bands[0]; // !!! there's just one band in this raster

            // don't return a color
            if (pixelValues === 0) return null;

            // scale to 0 - 1 used by chroma
            const scaledPixelValue = (pixelValues - min) / range;

            const color = scale(scaledPixelValue).hex();

            return color;
          };

          const layer = new GeoRasterLayer({
            georaster: georaster,
            opacity: 0.7,
            pixelValuesToColorFn: colorFn,
            resolution: 64 // optional parameter for adjusting display resolution
          });
          layer.addTo(map);
          setActiveLayer(layer);

          map.fitBounds(layer.getBounds());
        });
  };

  useEffect(() => {
    // restore map
    clearActiveLayer();
    // load geotiff
    loadGeotiff()
  }, [geotiff, mapTheme])

  return (
    <>
      <div>
        <button onClick={() => setGeotiff("/wind_speed_usa.tif")}>load sample 1</button>
        <button onClick={() => setGeotiff("/LC08_L1TP_045032_20180811_20180815_01_T1_B5.TIF")}>load sample 2</button>
      </div>
      <div>
        <button onClick={() => setMapTheme("Viridis")}>set theme viridis</button>
        <button onClick={() => setMapTheme("Spectral")}>set theme spectral</button>
      </div>
      <div>
        <button onClick={() => clearActiveLayer()}>clear</button>
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
