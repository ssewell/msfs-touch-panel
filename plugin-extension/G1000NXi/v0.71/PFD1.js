const SoftkeyLabel = {
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
}

const SoftkeyLabelValue = {
    // Map/HSI - Detail
    all: { desc: 'All', value: 1 },
    1: { desc: '1', value: 2 },
    2: { desc: '2', value: 3 },
    3: { desc: '3', value: 4 },
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
        
        SimVar.SetSimVarValue('L:PFD_SOFTKEY_' + (index + 1) + '_LABEL', 'number', labelValue);
    });
}
