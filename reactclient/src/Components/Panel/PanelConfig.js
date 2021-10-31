
import { lazy } from 'react';

// Default
export const TelemetryPanel_Default = lazy(() => import('./Default/TelemetryPanel'));
export const AutoPilotPanel_Default = lazy(() => import('./Default/AutoPilotPanel'));
export const NavPanel_Default = lazy(() => import('./Default/NavPanel'));
export const ComPanel_Default = lazy(() => import('./Default/ComPanel'));
export const TransponderPanel_Default = lazy(() => import('./Default/TransponderPanel'));
export const ElectricalPanel_Default = lazy(() => import('./Default/ElectricalPanel'));
export const AtcPanel_Default = lazy(() => import('./Default/AtcPanel'));

// C172
export const AutoPilotPanel_C172 = lazy(() => import('./C172/AutoPilotPanel'));
export const ElectricalPanel_C172 = lazy(() => import('./C172/ElectricalPanel'));
export const NavPanel_C172  = lazy(() => import('./C172/NavPanel'));

export const config = {
    DEFAULT: [
        { id: 'TelemetryPanel_Default', key: 'TelemetryPanel', name: 'Telemetry'},
        { id: 'ComPanel_Default', key: 'ComPanel', name: 'Communication'},
        { id: 'NavPanel_Default', key: 'NavPanel', name: 'NAV / XPNDR / Barometer'},
        { id: 'AutoPilotPanel_Default', key: 'AutoPilotPanel', name: 'Autopilot'},
        { id: 'ElectricalPanel_Default', key: 'ElectricalPanel', name: 'Electrical'},
        { id: 'AtcPanel_Default', key: 'AtcPanel', name: 'ATC / Sim Rate'}
    ],
    C152: [
        { id: 'TelemetryPanel_Default', key: 'TelemetryPanel', name: 'Telemetry'},
        { id: 'ComPanel_Default', key: 'ComPanel', name: 'Communication'},
        { id: 'NavPanel_Default', key: 'NavPanel', name: 'NAV / XPNDR / Barometer'},
        { id: 'ElectricalPanel_C172', key: 'ElectricalPanel', name: 'Electrical'},
        { id: 'AtcPanel_Default', key: 'AtcPanel', name: 'ATC'}
    ],
    C172: [
        { id: 'TelemetryPanel_Default', key: 'TelemetryPanel', name: 'Telemetry'},
        { id: 'ComPanel_Default', key: 'ComPanel', name: 'Communication'},
        { id: 'NavPanel_C172', key: 'NavPanel', name: 'NAV / XPNDR / Barometer'},
        { id: 'AutoPilotPanel_C172', key: 'AutoPilotPanel', name: 'Autopilot'},
        { id: 'ElectricalPanel_C172', key: 'ElectricalPanel', name: 'Electrical'},
        { id: 'AtcPanel_Default', key: 'AtcPanel', name: 'ATC'}
    ]
}