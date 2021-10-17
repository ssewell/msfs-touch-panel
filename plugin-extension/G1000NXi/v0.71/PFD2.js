renderToSoftKeys() {
        this.currentMenu.forEach((item, index) => {
            var _a;
            (_a = this.softKeys) === null || _a === void 0 ? void 0 : _a.setMenuItem(index, item);
        });

        /*** MSFS Touch Panel code ***/
        updateSoftKeysLVar(this.currentMenu);
    }
