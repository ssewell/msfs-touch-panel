
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
export const AutoPilotPanel_C172_G1000NXi = lazy(() => import('./C172/AutoPilotPanel'));
export const ElectricalPanel_C172_G1000NXi = lazy(() => import('./C172/ElectricalPanel'));

// G1000NXi
export const NavPanel_G1000NXi = lazy(() => import('./G1000NXi/NavPanel'));
export const FmsPanel_G1000NXi = lazy(() => import('../ControlGroup/G1000NXi/Fms'));

export const config = {
    DEFAULT: [
        { id: 'TelemetryPanel_Default', key: 'TelemetryPanel', name: 'Telemetry'},
        { id: 'ComPanel_Default', key: 'ComPanel', name: 'Communication'},
        { id: 'NavPanel_Default', key: 'NavPanel', name: 'Navigation'},
        { id: 'AutoPilotPanel_Default', key: 'AutoPilotPanel', name: 'Autopilot'},
        { id: 'TransponderPanel_Default', key: 'TransponderPanel', name: 'Transponder / Baro'},
        { id: 'ElectricalPanel_Default', key: 'ElectricalPanel', name: 'Electrical'},
        { id: 'AtcPanel_Default', key: 'AtcPanel', name: 'ATC / Sim Rate'}
    ],
    C152: [
        { id: 'TelemetryPanel_Default', key: 'TelemetryPanel', name: 'Telemetry'},
        { id: 'ComPanel_Default', key: 'ComPanel', name: 'Communication'},
        { id: 'NavPanel_Default', key: 'NavPanel', name: 'Navigation'},
        { id: 'TransponderPanel_Default', key: 'TransponderPanel', name: 'Transponder'},
        { id: 'ElectricalPanel_C172_G1000NXi', key: 'ElectricalPanel', name: 'Electrical'},
        { id: 'AtcPanel_Default', key: 'AtcPanel', name: 'ATC'}
    ],
    C172_G1000NXi: [
        { id: 'TelemetryPanel_Default', key: 'TelemetryPanel', name: 'Telemetry'},
        { id: 'ComPanel_Default', key: 'ComPanel', name: 'Communication'},
        { id: 'NavPanel_G1000NXi', key: 'NavPanel', name: 'NAV / XPNDR / FMS'},
        { id: 'AutoPilotPanel_C172_G1000NXi', key: 'AutoPilotPanel', name: 'Autopilot'},
        { id: 'ElectricalPanel_C172_G1000NXi', key: 'ElectricalPanel', name: 'Electrical'},
        { id: 'AtcPanel_Default', key: 'AtcPanel', name: 'ATC'}
    ]
}