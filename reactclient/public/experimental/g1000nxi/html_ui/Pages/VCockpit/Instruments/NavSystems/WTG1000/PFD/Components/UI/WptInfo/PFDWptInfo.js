import { FSComponent } from 'msfssdk';
import { LatLonDisplay } from 'msfssdk/components/common';
import { PFDWptDupDialog } from '../WptDup/PFDWptDupDialog';
import { WptInfo } from '../../../../Shared/UI/WptInfo/WptInfo';
import './PFDWptInfo.css';
/**
 * The PFD waypoint info popout.
 */
export class PFDWptInfo extends WptInfo {
    // eslint-disable-next-line jsdoc/require-jsdoc
    getWptDupDialogName() {
        return PFDWptDupDialog.name;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    render() {
        return (FSComponent.buildComponent("div", { class: 'popout-dialog pfd-wptinfo', ref: this.viewContainerRef },
            FSComponent.buildComponent("h1", null, this.props.title),
            this.renderWaypointInput(),
            FSComponent.buildComponent("hr", null),
            FSComponent.buildComponent("div", { class: 'pfd-wptinfo-data' },
                FSComponent.buildComponent("div", { class: 'pfd-wptinfo-data-field pfd-wptinfo-bearing' },
                    FSComponent.buildComponent("div", { class: 'pfd-wptinfo-data-field-title' }, "BRG"),
                    this.renderBearing()),
                FSComponent.buildComponent("div", { class: 'pfd-wptinfo-data-field pfd-wptinfo-distance' },
                    FSComponent.buildComponent("div", { class: 'pfd-wptinfo-data-field-title' }, "DIS"),
                    this.renderDistance()),
                FSComponent.buildComponent("div", { class: 'pfd-wptinfo-region' }, this.store.region),
                FSComponent.buildComponent(LatLonDisplay, { location: this.store.location, class: 'pfd-wptinfo-latlon' })),
            FSComponent.buildComponent("div", { class: 'pfd-wptinfo-prompt' }, this.store.prompt)));
    }
}
