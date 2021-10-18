import { FSComponent } from 'msfssdk';
import { UiControlGroup } from '../../../../Shared/UI/UiControlGroup';
import './MFDMapSettingsGroup.css';
/**
 * A component which displays a group of controls to adjust map settings.
 */
export class MFDMapSettingsGroup extends UiControlGroup {
    constructor() {
        super(...arguments);
        this.containerRef = FSComponent.createRef();
    }
    /**
     * Shows this group.
     */
    show() {
        this.containerRef.instance.style.display = '';
    }
    /**
     * Hides this group.
     */
    hide() {
        this.containerRef.instance.style.display = 'none';
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { ref: this.containerRef, class: 'mfd-mapsettings-group', style: 'display: none;' },
            FSComponent.buildComponent("div", { class: 'mfd-mapsettings-group-rightbg' }),
            this.getSettingRows(this.containerRef)));
    }
}
