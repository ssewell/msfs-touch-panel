handleSoftKey(hEvent) {
        const softKeyIndex = parseInt(hEvent.replace(this.hEventPrefix, '')) - 1;
        this.currentMenu.handleItemPressed(softKeyIndex);

        /*** MSFS Touch Panel code ***/
        updateSoftKeysLVar(this.currentMenu);
    }
