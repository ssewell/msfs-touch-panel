export const calcIncrementDecrementValue = (step, dataValue, minValue, maxValue, loopBack, decimalPlaces) =>{

    // apply increment or decrement function
    let newValue;

    if (typeof step === 'function')
        newValue = step(dataValue);
    else
        newValue = Number((dataValue + step).toFixed(decimalPlaces));

    if (loopBack) {
        // Do the whole number part
        let wholeValue = Math.floor(newValue);
        let decValue = Number((newValue % 1).toFixed(decimalPlaces));
        let max = Math.floor(maxValue);
        let min = Math.floor(minValue);

        if (wholeValue < min)
            wholeValue = (max - min + 1) + wholeValue;
        else if (wholeValue > max)
            wholeValue = wholeValue - (max - min + 1);

        // Do the decimal part
        if (decimalPlaces > 0) {
            if (wholeValue < min)
                wholeValue = max;
            else if (wholeValue > max)
                wholeValue = min;
        }

        newValue = wholeValue + decValue;
    }

    newValue = Number(newValue.toFixed(decimalPlaces));

    if (newValue >= minValue && newValue <= maxValue)
        return(newValue);
    else
        return null;
}