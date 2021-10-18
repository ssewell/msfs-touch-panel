import { AirspaceType } from 'msfssdk/navigation';
import { AbstractAirspaceRenderManager, NullAirspaceRenderer, SingleLineAirspaceRenderer, MultiLineAirspaceRenderer } from 'msfssdk/components/map';
var AirspaceRenderType;
(function (AirspaceRenderType) {
    AirspaceRenderType[AirspaceRenderType["ClassB"] = 0] = "ClassB";
    AirspaceRenderType[AirspaceRenderType["ClassC"] = 1] = "ClassC";
    AirspaceRenderType[AirspaceRenderType["ClassD"] = 2] = "ClassD";
    AirspaceRenderType[AirspaceRenderType["Restricted"] = 3] = "Restricted";
    AirspaceRenderType[AirspaceRenderType["MOA"] = 4] = "MOA";
    AirspaceRenderType[AirspaceRenderType["Other"] = 5] = "Other";
    AirspaceRenderType[AirspaceRenderType["Null"] = 6] = "Null";
})(AirspaceRenderType || (AirspaceRenderType = {}));
/**
 * An airspace render manager which renders Garmin-style airspaces.
 */
export class AirspaceRenderManager extends AbstractAirspaceRenderManager {
    /**
     * Constructor.
     */
    constructor() {
        super();
        this.renderers = [];
        this.initRenderers();
    }
    /**
     * Initializes this manager's airspace renderers.
     */
    initRenderers() {
        this.renderers[AirspaceRenderType.ClassB] = new SingleLineAirspaceRenderer(1.5, '#3080ff', []);
        this.renderers[AirspaceRenderType.ClassC] = new SingleLineAirspaceRenderer(1.5, '#4a0045', []);
        this.renderers[AirspaceRenderType.ClassD] = new SingleLineAirspaceRenderer(1.5, '#3080ff', [5, 5]);
        this.renderers[AirspaceRenderType.Restricted] = new CombedAirspaceRenderer('#3080ff', 1.5, false, 6, [1.5, 2.5]);
        this.renderers[AirspaceRenderType.MOA] = new CombedAirspaceRenderer('#4a0045', 1.5, false, 6, [1.5, 2.5]);
        this.renderers[AirspaceRenderType.Null] = new NullAirspaceRenderer();
    }
    // eslint-disable-next-line jsdoc/require-jsdoc, @typescript-eslint/no-unused-vars
    getRenderOrder(a, b) {
        return 0;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    getAirspaceRenderer(airspace) {
        switch (airspace.type) {
            case AirspaceType.ClassB:
                return this.renderers[AirspaceRenderType.ClassB];
            case AirspaceType.ClassC:
                return this.renderers[AirspaceRenderType.ClassC];
            case AirspaceType.ClassD:
                return this.renderers[AirspaceRenderType.ClassD];
            case AirspaceType.Restricted:
                return this.renderers[AirspaceRenderType.Restricted];
            case AirspaceType.MOA:
                return this.renderers[AirspaceRenderType.MOA];
            default:
                return this.renderers[AirspaceRenderType.Null];
        }
    }
}
/**
 * Renders airspace boundaries with a comb-like pattern.
 */
class CombedAirspaceRenderer extends MultiLineAirspaceRenderer {
    /**
     * Constructor.
     * @param color The color of the rendered airspace.
     * @param baseLineWidth The stroke width of the base line that is drawn on the airspace boundary.
     * @param teethOutside Whether the teeth should appear on the outside of the boundary.
     * @param teethWidth The width of the teeth.
     * @param teethDash The dash of the teeth.
     */
    constructor(color, baseLineWidth, teethOutside, teethWidth, teethDash) {
        super();
        this.color = color;
        this.baseLineWidth = baseLineWidth;
        this.teethOutside = teethOutside;
        this.teethWidth = teethWidth;
        this.teethDash = teethDash;
    }
    // eslint-disable-next-line jsdoc/require-jsdoc
    renderLines(context, vertexArray, vertexNormals, length, isClosed) {
        // render base line
        this.renderLine(context, vertexArray, vertexNormals, length, isClosed, 0, this.baseLineWidth, this.color, CombedAirspaceRenderer.emptyDash);
        // render teeth
        this.renderLine(context, vertexArray, vertexNormals, length, isClosed, this.teethWidth / 2 * (this.teethOutside ? -1 : 1), this.teethWidth, this.color, this.teethDash);
    }
}
CombedAirspaceRenderer.emptyDash = [];
