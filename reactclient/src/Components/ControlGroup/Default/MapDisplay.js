import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useSimConnectData } from '../../../Services/DataProviders/SimConnectDataProvider';
import { simConnectGetFlightPlan } from '../../../Services/DataProviders/SimConnectDataProvider';
import { useLocalStorageData } from '../../../LocalStorageProvider';
import { useInterval } from '../../Util/hooks';
import { useMap, LayersControl, LayerGroup, TileLayer, useMapEvents } from 'react-leaflet'
import L from 'leaflet';
import 'leaflet.marker.slideto';
import 'leaflet-marker-rotation';
import '@elfalem/leaflet-curve';
import { getDistance } from 'geolib';

const mapProvider = {
    default: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    topo: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    dark: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    googleStreet: 'http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
    googleTerrain: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
    googleSatellite: 'http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}',
    googleHybrid: 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
    aviation: 'http://{s}.tile.maps.openaip.net/geowebcache/service/tms/1.0.0/openaip_basemap@EPSG%3A900913@png/{z}/{x}/{y}.png',
}

// This is to create two control points XXXX meters away any give waypoint to give flight path
// a smooth quadratic bezier curve transition. You can adjust the bezier curve radius with the constant below
const bezierCurveRadius = 3000;

const getControlPoints = (waypoints) => {
    let controlPoints = [];

    for (var i = 0; i < waypoints.length; i++) {
        let prevWp = i === 0 ? null : waypoints[i - 1].latLong;
        let curWp = waypoints[i].latLong;
        let nextWp = i === waypoints.length - 1 ? null : waypoints[i + 1].latLong;

        var distance1 = prevWp === null ? null : getDistance({ latitude: prevWp[0], longitude: prevWp[1] }, { latitude: curWp[0], longitude: curWp[1] });
        var distance2 = nextWp === null ? null : getDistance({ latitude: curWp[0], longitude: curWp[1] }, { latitude: nextWp[0], longitude: nextWp[1] });

        let ratio1 = (distance1 / bezierCurveRadius) > 2 ? (distance1 / bezierCurveRadius) : 2;
        let ratio2 = (distance2 / bezierCurveRadius) > 2 ? (distance2 / bezierCurveRadius) : 2;

        var p1 = prevWp === null ? null : [(prevWp[0] - curWp[0]) / ratio1 + curWp[0], (prevWp[1] - curWp[1]) / ratio1 + curWp[1]];
        var p2 = nextWp === null ? null : [(nextWp[0] - curWp[0]) / ratio2 + curWp[0], (nextWp[1] - curWp[1]) / ratio2 + curWp[1]];

        controlPoints.push({ p1: p1, p2: p2 });
    }

    return controlPoints;
}

const getWaypointTooltip = (waypoint) => {
    let tooltip = waypoint.id;
    if (waypoint.altitude !== null)
        tooltip += '<br/>' + waypoint.altitude + 'ft';

    return tooltip;
}

const drawFlightPath = (layerGroup, waypoints, showFlightPlanLabel) => {
    let path, line, marker, tooltip;
    let controlPoints = getControlPoints(waypoints);

    waypoints.forEach((waypoint, index) => {
        let controlPoint = controlPoints[index];
        let nextControlPoint = controlPoints[index + 1];

        // First waypoint
        if (controlPoint.p1 === null) {
            path = [waypoint.latLong, controlPoint.p2];
            line = new L.Polyline(path);
            layerGroup.addLayer(line);

            // Departure airport marker
            tooltip = getWaypointTooltip(waypoint);
            marker = L.marker(waypoint.latLong).bindTooltip(tooltip, { permanent: showFlightPlanLabel });
            layerGroup.addLayer(marker);
        }
        // Last waypoint
        else if (controlPoint.p2 === null) {
            path = [controlPoint.p1, waypoint.latLong];
            line = new L.Polyline(path);
            layerGroup.addLayer(line);

            // Arrival airport marker
            tooltip = getWaypointTooltip(waypoint);
            marker = L.marker(waypoint.latLong).bindTooltip(tooltip, { permanent: showFlightPlanLabel });
            layerGroup.addLayer(marker);
        }
        // All other waypoints inbetween, draw bezier curve
        else {
            path = ['M', controlPoint.p1, 'Q', waypoint.latLong, controlPoint.p2];
            line = L.curve(path);
            layerGroup.addLayer(line);

            // Waypoint marker
            tooltip = getWaypointTooltip(waypoint);
            marker = L.circleMarker(waypoint.latLong).bindTooltip(tooltip, { permanent: showFlightPlanLabel });
            layerGroup.addLayer(marker);
        }

        // Draw inbetween control points line
        if (index < waypoints.length - 1) {
            path = [controlPoint.p2, nextControlPoint.p1];
            line = new L.Polyline(path);
            layerGroup.addLayer(line);
        }
    })
}

const MapDisplay = ({ centerPlane, flightFollowing, showFlightPlan, showFlightPlanLabel, loadFlightPlan, dragstart }) => {
    const { simConnectData, simConnectSystemEvent } = useSimConnectData();
    const { PLANE_HEADING_TRUE, GPS_LAT, GPS_LON } = simConnectData;
    const { mapConfig, updateMapConfig, configurationData } = useLocalStorageData();
    const { mapRefreshInterval } = configurationData;
    const [waypoints, setWaypoints] = useState(JSON.stringify(null));

    const planePosition = useRef([GPS_LAT * 180 / Math.PI, GPS_LON * 180 / Math.PI]);
    const mapPosition = useRef([GPS_LAT * 180 / Math.PI, GPS_LON * 180 / Math.PI]);

    const map = useMap();
    const layerGroupFlightPlan = useRef();
    const planeMarker = useRef();

    const selectedLayer = useRef('Default');

    const planeIconDark = L.icon({
        iconUrl: 'img/airplane-dark.png',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });

    const planeIconLight = L.icon({
        iconUrl: 'img/airplane-light.png',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });

    useEffect(() => {
        layerGroupFlightPlan.current = L.layerGroup();
        map.addLayer(layerGroupFlightPlan.current);

        planeMarker.current = L.rotatedMarker([0, 0], { icon: planeIconDark, rotationAngle: 0, rotationOrigin: 'center' });
        map.addLayer(planeMarker.current);

        map.on("baselayerchange", e => {
            let config = { ...mapConfig };
            config.currentLayer = e.name;
            updateMapConfig(config);

            switch (e.name) {
                case 'Dark':
                case 'Google Satellite':
                case 'Google Hybrid':
                    planeMarker.current.setIcon(planeIconLight);
                    break;
                default:
                    planeMarker.current.setIcon(planeIconDark);
                    break;
            }

            selectedLayer.current = mapConfig.currentLayer;
        });
    }, [map])

    useEffect(() => {
        if (planePosition.current !== null) {
            planeMarker.current.setLatLng(planePosition.current);
            planeMarker.current.setRotationAngle(PLANE_HEADING_TRUE);
        }
    }, []);

    useInterval(() => {
        planePosition.current = [GPS_LAT * 180 / Math.PI, GPS_LON * 180 / Math.PI];
    }, mapRefreshInterval);

    useEffect(() => {
        mapPosition.current = planePosition.current;
        if (mapPosition.current !== null)
            map.panTo(mapPosition.current);
    }, [centerPlane, map])

    useEffect(() => {
        if (loadFlightPlan || (simConnectSystemEvent !== null && simConnectSystemEvent === 'SIMSTART')) {
            simConnectGetFlightPlan().then(data => {
                if (data !== undefined && data !== null) {
                    setWaypoints(JSON.stringify(data));
                }
            });
        }
    }, [loadFlightPlan, simConnectSystemEvent])

    useEffect(() => {
        layerGroupFlightPlan.current.clearLayers();
        if (JSON.parse(waypoints) !== null)
            drawFlightPath(layerGroupFlightPlan.current, JSON.parse(waypoints), showFlightPlanLabel);
    }, [waypoints, showFlightPlanLabel]);

    useEffect(() => {
        if (flightFollowing)
            map.panTo(planePosition.current);

        if (planePosition.current !== null) {
            planeMarker.current.slideTo(planePosition.current, { duration: mapRefreshInterval });
            planeMarker.current.setRotationAngle(PLANE_HEADING_TRUE);
        }
    }, [flightFollowing, map, mapRefreshInterval, planePosition.current])

    useMapEvents({
        dragstart: (e) => {
            if (dragstart != null)
                dragstart();
        },
    });

    return useMemo(() => (
        <LayersControl>
            <LayersControl.BaseLayer name='Default' checked={selectedLayer.current === 'Default'}>
                <TileLayer url={mapProvider.default} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name='Topo' checked={selectedLayer.current === 'Topo'}>
                <TileLayer url={mapProvider.topo} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name='Dark' checked={selectedLayer.current === 'Dark'}>
                <TileLayer url={mapProvider.dark} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name='Google Street' checked={selectedLayer.current === 'Google Street'}>
                <TileLayer url={mapProvider.googleStreet} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name='Google Terrain' checked={selectedLayer.current === 'Google Terrain'}>
                <TileLayer url={mapProvider.googleTerrain} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name='Google Satellite' checked={selectedLayer.current === 'Google Satellite'}>
                <TileLayer url={mapProvider.googleSatellite} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name='Google Hybrid' checked={selectedLayer.current === 'Google Hybrid'}>
                <TileLayer url={mapProvider.googleHybrid} />
            </LayersControl.BaseLayer>
            <LayersControl.Overlay name='Aviation'>
                <TileLayer url={mapProvider.aviation} tms={true} detectRetina={true} subdomains='12' />
            </LayersControl.Overlay>
            <LayersControl.Overlay checked={showFlightPlan} name='Flight Plan'>
                <LayerGroup id='lgFlightPlan' ref={layerGroupFlightPlan} />
            </LayersControl.Overlay>
        </LayersControl>
    ), [showFlightPlan, layerGroupFlightPlan.current])
}

MapDisplay.defaultProps = {
    showFlightPlanLabel: false,
    flightFollowing: true
};

export default MapDisplay;