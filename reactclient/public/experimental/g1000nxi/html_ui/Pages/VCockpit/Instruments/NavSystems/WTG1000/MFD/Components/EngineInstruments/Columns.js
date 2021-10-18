import { FSComponent, DisplayComponent } from 'msfssdk';
import { XMLGaugeType } from 'msfssdk/components/XMLGauges';
import { XMLCircleGauge } from './DialGauge';
import { XMLHorizontalGauge, XMLDoubleHorizontalGauge } from './HorizontalBarGauge';
import { XMLDoubleVerticalGauge } from './VerticalBarGauge';
import { XMLTextGauge } from './TextGauge';
import { CylinderTempGauge, CylinderTempGaugeTwin } from './CylinderTempGauge';
/**
 * The XMLColumnGroup is the fundamental container for an EIS.  It will always be present to at least
 * contain all the gauges defined in panel.xml.  There may be additional groups present if there were
 * more column groups explicitly defined in the XML configuration.
 */
export class XMLColumnGroup extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.theDiv = FSComponent.createRef();
        this.theRow = FSComponent.createRef();
    }
    /** Do things after rendering. */
    onAfterRender() {
        let columnsWithoutWidth = 0;
        let widthPercentUsed = 0;
        const columns = new Array();
        if (this.props.id !== undefined) {
            this.theDiv.instance.classList.add(this.props.id);
        }
        for (const column of this.props.columns) {
            const ref = FSComponent.createRef();
            FSComponent.render(FSComponent.buildComponent(XMLGaugeColumn, { bus: this.props.bus, ref: ref, logicHandler: this.props.logicHost, gaugeConfig: column.gauges }), this.theRow.instance);
            columns.push(ref);
            if (column.width !== undefined && column.width > 0) {
                widthPercentUsed += column.width;
            }
            else {
                columnsWithoutWidth++;
            }
        }
        for (let i = 0; i < columns.length; i++) {
            const width = this.props.columns[i].width;
            if (width !== undefined && width > 0) {
                columns[i].instance.style.width = `${width}%`;
            }
            else {
                columns[i].instance.style.width = `${(100 - widthPercentUsed) / columnsWithoutWidth}%`;
            }
            columns[i].instance.classList.add(`Column${this.props.columns[i].id !== undefined ? this.props.columns[i].id : ''}`);
        }
    }
    /**
     * Render a column group.
     * @returns A VNode of the group.
     */
    render() {
        return FSComponent.buildComponent("table", { class: 'gauge_column_table', ref: this.theDiv },
            FSComponent.buildComponent("tr", { class: 'gauge_column_row', ref: this.theRow }));
    }
}
/** A single column of gauges. */
export class XMLGaugeColumn extends DisplayComponent {
    /** Draw all our gauges after rendering. */
    onAfterRender() {
        for (const gauge of this.props.gaugeConfig) {
            switch (gauge.gaugeType) {
                case XMLGaugeType.Circular:
                    FSComponent.render(FSComponent.buildComponent(XMLCircleGauge, Object.assign({ logicHost: this.props.logicHandler }, gauge.configuration)), this.props.ref.instance);
                    break;
                case XMLGaugeType.Horizontal:
                    FSComponent.render(FSComponent.buildComponent(XMLHorizontalGauge, Object.assign({ logicHost: this.props.logicHandler }, gauge.configuration)), this.props.ref.instance);
                    break;
                case XMLGaugeType.DoubleHorizontal:
                    FSComponent.render(FSComponent.buildComponent(XMLDoubleHorizontalGauge, Object.assign({ logicHost: this.props.logicHandler }, gauge.configuration)), this.props.ref.instance);
                    break;
                case XMLGaugeType.DoubleVertical:
                    FSComponent.render(FSComponent.buildComponent(XMLDoubleVerticalGauge, Object.assign({ logicHost: this.props.logicHandler }, gauge.configuration)), this.props.ref.instance);
                    break;
                case XMLGaugeType.Cylinder:
                    FSComponent.render(FSComponent.buildComponent(CylinderTempGauge, Object.assign({ bus: this.props.bus, logicHost: this.props.logicHandler }, gauge.configuration)), this.props.ref.instance);
                    break;
                case XMLGaugeType.TwinCylinder:
                    FSComponent.render(FSComponent.buildComponent(CylinderTempGaugeTwin, Object.assign({ bus: this.props.bus, logicHost: this.props.logicHandler }, gauge.configuration)), this.props.ref.instance);
                    break;
                case XMLGaugeType.Text:
                    FSComponent.render(FSComponent.buildComponent(XMLTextGauge, Object.assign({ logicHost: this.props.logicHandler }, gauge.configuration)), this.props.ref.instance);
                    break;
                case XMLGaugeType.ColumnGroup:
                    console.log('creating a column group');
                    console.log(gauge.configuration);
                    FSComponent.render(FSComponent.buildComponent(XMLColumnGroup, Object.assign({ logicHost: this.props.logicHandler }, gauge.configuration)), this.props.ref.instance);
                    break;
            }
        }
    }
    /**
     * Render the column.
     * @returns a VSNode
     */
    render() {
        return FSComponent.buildComponent("td", { ref: this.props.ref });
    }
}
