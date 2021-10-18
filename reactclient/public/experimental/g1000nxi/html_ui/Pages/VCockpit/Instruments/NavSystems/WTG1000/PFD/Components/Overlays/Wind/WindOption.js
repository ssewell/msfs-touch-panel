import { FSComponent, DisplayComponent } from 'msfssdk';
/**
 * The Wind Option Component
 */
export class WindOption extends DisplayComponent {
    constructor() {
        super(...arguments);
        this.containerRef = FSComponent.createRef();
    }
    /**
     * Do stuff after rendering.
     */
    onAfterRender() {
        //noop
    }
    /**
     * Set as visible or not.
     * @param isVisible is whether to set this visible or not.
     */
    setVisible(isVisible) {
        if (isVisible) {
            this.containerRef.instance.classList.remove('disabled');
        }
        else {
            this.containerRef.instance.classList.add('disabled');
        }
    }
    /**
     * Renders the component - to be overridden.
     * @returns The component VNode.
     */
    render() {
        return (FSComponent.buildComponent("div", null));
    }
}
