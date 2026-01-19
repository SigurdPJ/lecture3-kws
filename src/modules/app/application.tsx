import React, { useEffect, useRef, useState } from "react";
import { Feature, Map, MapBrowserEvent, View } from "ol";
import TileLayer from "ol/layer/Tile.js";
import { OSM } from "ol/source.js";
import { useGeographic } from "ol/proj.js";

import "ol/ol.css";
import "./application.css";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { GeoJSON } from "ol/format.js";
import { Style, Text } from "ol/style.js";
import type { FeatureLike } from "ol/Feature.js";
import { getCenter } from "ol/extent.js";

useGeographic();

const fylkeSource = new VectorSource({
  url: "/lecture3-kws/geojson/fylker.geojson",
  format: new GeoJSON(),
});
const fylkeLayer = new VectorLayer({
  source: fylkeSource,
});
const kommuneSource = new VectorSource({
  url: "/lecture3-kws/geojson/kommuner.geojson",
  format: new GeoJSON(),
});
const kommuneLayer = new VectorLayer({
  source: kommuneSource,
});

const layers = [new TileLayer({ source: new OSM() }), kommuneLayer, fylkeLayer];
const view = new View({ center: [11, 59], zoom: 8 });
const map = new Map({ layers, view });

function Application() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    map.setTarget(mapRef.current!);
  }, []);

  const [activeFylke, setActiveFylke] = useState<Feature>();
  function activeFylkeStyle(fylke: FeatureLike) {
    const fylkesnavn = fylke.getProperties()["fylkesnavn"];
    return new Style({ text: new Text({ text: fylkesnavn }) });
  }
  function handlePointerMove(event: MapBrowserEvent) {
    const fylke = fylkeSource.getFeaturesAtCoordinate(event.coordinate);
    setActiveFylke(fylke.length > 0 ? fylke[0] : undefined);
  }
  useEffect(() => {
    activeFylke?.setStyle(activeFylkeStyle);
    return () => activeFylke?.setStyle(undefined);
  }, [activeFylke]);
  useEffect(() => {
    map.on("pointermove", handlePointerMove);
  }, []);

  const [selectedKommune, setSelectedKommune] = useState<Feature>();
  function handleClick(event: MapBrowserEvent) {
    const kommune = kommuneSource.getFeaturesAtCoordinate(event.coordinate);
    setSelectedKommune(kommune.length > 0 ? kommune[0] : undefined);
  }
  useEffect(() => {
    map.on("click", handleClick);
  }, []);

  const [allKommuner, setAllKommuner] = useState<Feature[]>([]);
  useEffect(() => {
    kommuneSource.on("change", () =>
      setAllKommuner(kommuneSource.getFeatures()),
    );
  }, []);
  function handleClickKommune(kommune: Record<string, any>) {
    view.animate({ center: getCenter(kommune["geometry"]!.getExtent()) });
  }

  return (
    <>
      <h1>
        {selectedKommune
          ? selectedKommune.getProperties()["kommunenavn"]
          : "Administrative regioner i Norge"}
      </h1>
      <main>
        <div ref={mapRef}></div>
        <aside>
          <h2>Alle kommuner</h2>
          <ul>
            {allKommuner
              .map((f) => f.getProperties())
              .sort((a, b) => a["kommunenavn"].localeCompare(b["kommunenavn"]))
              .map((k) => (
                <li key={k["kommunenummer"]}>
                  <a href={"#"} onClick={() => handleClickKommune(k)}>
                    {k["kommunenavn"]}
                  </a>
                </li>
              ))}
          </ul>
        </aside>
      </main>
    </>
  );
}

export default Application;
