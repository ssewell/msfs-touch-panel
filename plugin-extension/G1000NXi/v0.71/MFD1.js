const SoftkeyLabel = {
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

const SoftkeyLabelValue = {
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

const updateSoftKeysLVar = (menu) => {
    menu.forEach((item, index) => {
        let label = item.label.get();

        if(label === ''){
            label = null;
        }
        else{
            label = label.toLowerCase();
            label = 'm_' + label;
            label = label.replace(' ', '_');
            label = label.replace('/', '_');
            label = label.replace('-', 'minus');
            label = label.replace('+', 'plus');
        }

        let dataValue = item.value.get();

        let labelValue = -1;

        if (label !== null && SoftkeyLabel[label] !== undefined) {
            labelValue = SoftkeyLabel[label].value * 100;

            if (!item.disabled.get())
                labelValue += 1;

            if (typeof dataValue === 'boolean')
                labelValue += 2;

            if (typeof dataValue === 'boolean' && dataValue)
                labelValue += 4;

            if (typeof dataValue === 'string' && dataValue !== null && dataValue !== '') {
                dataValue = dataValue.toLowerCase().replace(' ', '_').replace('/', '_');
                if (SoftkeyLabelValue[dataValue] !== undefined) {
                    labelValue += SoftkeyLabelValue[dataValue].value * 0.01;
                }
            }
        }

        SimVar.SetSimVarValue('L:MFD_SOFTKEY_' + (index + 1) + '_LABEL', 'number', labelValue);
    });
}
