import * as PopoutPanelDefinition from './PopoutPanelDefinition';
import * as PopoutPanelStyles from './PopoutPanelStyles';

export const POPOUT_PANEL_INFO = [
    { planetype: 'g1000nxi', panel: 'pfd', width: 1408, height: 914, panelRatio: 1408/914, iframeRatio: 1024/768, definitions: PopoutPanelDefinition.G1000NXI_PFD_DEF, styles: PopoutPanelStyles.G1000NXI_STYLES},
    { planetype: 'g1000nxi', panel: 'mfd', width: 1408, height: 914, panelRatio: 1408/914, iframeRatio: 1024/768, definitions: PopoutPanelDefinition.G1000NXI_MFD_DEF, styles: PopoutPanelStyles.G1000NXI_STYLES},
    { planetype: 'fbwa32nx', panel: 'cdu', width: 446, height: 674, panelRatio: 446/674, iframeRatio: 333/255, definitions: PopoutPanelDefinition.FBWA32NX_CDU_DEF, styles: PopoutPanelStyles.FBWA32NX_CDU_STYLES}
]
