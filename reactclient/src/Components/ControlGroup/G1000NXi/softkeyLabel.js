export const softkeyLabel = {
    PFD: {
        // Main
        m_map_hsi: { desc: 'Map/HSI', value: 1 },
        m_tfc_map: { desc: 'TFC Map', value: 2 },
        m_pfd_opt: { desc: 'PFD Opt', value: 3 },
        m_obs: { desc: 'OBS', value: 4 },
        m_cdi: { desc: 'CDI', value: 5 },
        m_adf_dme: { desc: 'ADF/DME', value: 6 },
        m_xpdr: { desc: 'XPDR', value: 7 },
        m_ident: { desc: 'Ident', value: 8 },
        m_tmr_ref: { desc: 'Tmr/Ref', value: 9 },
        m_nearest: { desc: 'Nearest', value: 10 },
        m_alerts: { desc: 'Alerts', value: 11 },

        // MAP/HSI
        m_layout: { desc: 'Layout', value: 12 },
        m_detail: { desc: 'Detail', value: 13 },
        m_traffic: { desc: 'Traffic', value: 14 },
        m_topo: { desc: 'Topo', value: 15 },
        m_rel_ter: { desc: 'Rel Ter', value: 16 },
        m_nexrad: { desc: 'NEXRAD', value: 17 },
        m_metar: { desc: 'METAR', value: 18 },
        m_lightning: { desc: 'Lightning', value: 19 },
        m_back: { desc: 'Back', value: 20 },
        //dupe: alerts: { desc: 'Alerts', value: 21 },

        // MAP/HSI - Layout
        m_map_off: { desc: 'Map Off', value: 22 },
        m_inset_map: { desc: 'Inset Map', value: 23 },
        m_hsi_map: { desc: 'HSI Map', value: 24 },
        //dupe: tfc_map: { desc: 'TFC Map', value: 25 },
        m_wx_lgnd: { desc: 'WX LGND', value: 26 },
        //dupe: back: { desc: 'Back', value: 27 },
        //dupe: alerts: { desc: 'Alerts', value: 28 },

        // PFD Option
        m_svt: { desc: 'SVT', value: 29 },
        m_wind: { desc: 'Wind', value: 30 },
        m_dme: { desc: 'DME', value: 31 },
        m_bearing_1: { desc: 'BEARING 1', value: 32 },
        m_bearing_2: { desc: 'BEARING 2', value: 33 },
        m_alt_units: { desc: 'ALT Units', value: 34 },
        m_std_baro: { desc: 'STD Baro', value: 35 },
        //dupe: back: { desc: 'Back', value: 36 },
        //dupe: alerts: { desc: 'Alerts', value: 37 },

        // PFD Option - SVT
        m_pathways: { desc: 'Pathways', value: 38 },
        m_terrain: { desc: 'Terrain', value: 39 },
        m_hdg_lbl: { desc: 'HDG LBL', value: 40 },
        m_apt_sign: { desc: 'APT Sign', value: 41 },
        //dupe: back: { desc: 'Back', value: 42 },
        //dupe: alerts: { desc: 'Alerts', value: 43 },

        // PFD Option - Wind
        m_off: { desc: 'Off', value: 44 },
        m_option_1: { desc: 'Option 1', value: 45 },
        m_option_2: { desc: 'Option 2', value: 46 },
        m_option_3: { desc: 'Option 3', value: 47 },
        //dupe: back: { desc: 'Back', value: 48 },
        //dupe: alerts: { desc: 'Alerts', value: 49 },

        // PFD Option - Alt Units
        m_meters: { desc: 'Meters', value: 50 },
        m_in: { desc: 'IN', value: 51 },
        m_hpa: { desc: 'HPA', value: 52 },
        //dupe: back: { desc: 'Back', value: 53 },
        //dupe: alerts: { desc: 'Alerts', value: 54 },

        // XPDR
        m_standby: { desc: 'Standby', value: 55 },
        m_on: { desc: 'On', value: 56 },
        m_alt: { desc: 'Alt', value: 57 },
        m_vfr: { desc: 'VFR', value: 58 },
        m_code: { desc: 'Code', value: 59 },
        //dupe: ident: { desc: 'Ident', value: 60 },
        //dupe: back: { desc: 'Back', value: 61 },
        //dupe: alerts: { desc: 'Alerts', value: 62 },

        // XPDR - Code
        m_0: { desc: '0', value: 63 },
        m_1: { desc: '1', value: 64 },
        m_2: { desc: '2', value: 65 },
        m_3: { desc: '3', value: 66 },
        m_4: { desc: '4', value: 67 },
        m_5: { desc: '5', value: 68 },
        m_6: { desc: '6', value: 69 },
        m_7: { desc: '7', value: 70 },
        //dupe: ident: { desc: 'Ident', value: 71 },
        m_bksp: { desc: 'BKSP', value: 72 },
        //dupe: back: { desc: 'Back', value: 73 },
        //dupe: alerts: { desc: 'Alerts', value: 74 }
    },
    MFD: {
        // Main
        m_engine: { desc: 'Engine', value: 1 },
        m_map_opt: { desc: 'Map Opt', value: 2 },
        m_detail: { desc: 'Detail', value: 3 },
        m_charts: { desc: 'Charts', value: 4 },
        m_checklist: { desc: 'Checklist', value: 5 },

        // Engine
        //dupe: engine: { desc: 'Engine', value: 6 },
        m_lean: { desc: 'Lean', value: 7 },
        m_system: { desc: 'System', value: 8 },
        m_back: { desc: 'Back', value: 9 },
        
        // Engine - Lean
        //dupe: engine: { desc: 'Engine', value: 10 },
        //dupe: lean: { desc: 'Lean', value: 11 },
        //dupe: system: { desc: 'System', value: 12 },
        m_cyl_slct: { desc: 'CYL SLCT', value: 13 },
        m_assist: { desc: 'Assist', value: 14 },
        //dupe: back: { desc: 'Back', value: 15 },

        // Engine - System
        //dupe: engine: { desc: 'Engine', value: 16 },
        //dupe: lean: { desc: 'Lean', value: 17 },
        //dupe: system: { desc: 'System', value: 18 },
        m_rst_fuel: { desc: 'RST Fuel', value: 19 },
        m_gal_rem: { desc: 'GAL REM', value: 20 },
        //dupe: back: { desc: 'Back', value: 21 },

        // Engine - System - Fuelrem
        m_minus10_gal: { desc: '-10 GAL', value: 70 },
        m_minus1_gal: { desc: '-1 GAL', value: 71 },
        m_plus1_gal: { desc: '+1 GAL', value: 72 },
        m_plus10_gal: { desc: '+10 GAL', value: 73 },
        m_35_gal: { desc: '35 GAL', value: 74 },
        m_53_gal: { desc: '53 GAL', value: 75 },

        // Map opt
        m_traffic: { desc: 'Traffic', value: 22 },
        m_inset: { desc: 'Inset', value: 23 },
        m_ter: { desc: 'TER', value: 24 },
        m_awy_off: { desc: 'AWY Off', value: 25 },
        m_nexrad: { desc: 'NEXRAD', value: 26 },
        m_xm_ltng: { desc: 'XM LTNG', value: 27 },
        m_metar: { desc: 'METAR', value: 28 },
        m_lighting: { desc: 'Lightning', value: 100 },
        m_legend: { desc: 'Legend', value: 29 },

        // Map opt - Inset
        m_off: { desc: 'Off', value: 31 },
        m_vsd: { desc: 'VSD', value: 32 },
        m_vsd_auto: { desc: 'VSD Auto', value: 33 },
        //dupe: back: { desc: 'Back', value: 34 },

        // Traffic Map
        m_tas_stby: { desc: 'TAS STBY', value: 35 },
        m_tas_oper: { desc: 'TAS OPER', value: 36 },
        m_ads_b: { desc: 'ADS-B', value: 37 },
        m_test: { desc: 'Test', value: 38 },
        m_motion: { desc: 'Motion', value: 39 },
        m_alt_mode: { desc: 'ALT Mode', value: 40 },

        // Traffic Map - motion
        m_absolute: { desc: 'Absolute', value: 41 },
        m_relative: { desc: 'Relative', value: 42 },
        m_duration: { desc: 'Duration', value: 43 },
        //dupe: off: { desc: 'Off', value: 43 },

        // Traffic Map - motion duration
        m_30_sec: { desc: '30 SEC', value: 44 },
        m_1_min: { desc: '1 MIN', value: 45 },
        m_2_min: { desc: '2 MIN', value: 46 },
        m_5_min: { desc: '5 MIN', value: 47 },

        // Traffic Map - alt mode
        m_below: { desc: 'Below', value: 48 },
        m_normal: { desc: 'Normal', value: 49 },
        m_above: { desc: 'Above', value: 50 },
        m_unrest: { desc: 'UNREST', value: 51 },

        // Flight Plan popout 
        //dupe:  engine: { desc: 'Engine', value: 52 },
        //dupe:  map_opt: { desc: 'Map Opt', value: 53 },
        m_new_wpt: { desc: 'New WPT', value: 54 },
        m_view: { desc: 'View', value: 55 },
        m_vnv_prof: { desc: 'VNV Prof', value: 56 },
        m_cncl_vnv: { desc: 'Cncl VNV', value: 57 },
        m_vnv_Ð: { desc: 'VNV Ð', value: 58 },
        m_atk_ofs: { desc: 'ATK OFS', value: 59 },
        //dupe: m_charts: { desc: 'Charts', value: 60 },
        //dupe: m_checklist: { desc: 'Checklist', value: 61 },

        // View 
        m_wide: { desc: 'Wide', value: 62 },
        m_narrow: { desc: 'Narrow', value: 63 },
        m_legminusleg: { desc: 'Leg-Leg', value: 64 },
        m_cum: { desc: 'CUM', value: 65 }
    }
}

export const softkeyLabelValue = {
    PFD: {
        // Detail
        all: { desc: 'All', value: 1 },
        1: { desc: '1', value: 2 },
        2: { desc: '2', value: 3 },
        3: { desc: '3', value: 4 },
    },
    MFD: {
        // Detail
        all: { desc: 'All', value: 1 },
        1: { desc: '1', value: 2 },
        2: { desc: '2', value: 3 },
        3: { desc: '3', value: 4 },

        // Map opt - TER
        off: { desc: 'Off', value: 5 },
        topo: { desc: 'Topo', value: 6 },
        rel: { desc: 'Rel', value: 7 }
    }
}
