import React from 'react';
import makeStyles from '@mui/styles/makeStyles';
import SevenSegmentDisplayDigit from './SevenSegmentDisplay/SevenSegmentDisplayDigit';

const useStyles = makeStyles(() => ({
    root: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        margin: '0.25em'
    },
    panel: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
        alignItems: 'flex-end',
        padding: 0,
        margin: 0
    }
}));

const SevenSegmentDisplay = ({ fontSizeInEm, onColor, offColor, numberOfDisplayDigit, decimalPlaces, value, onClick }) => {
    const classes = useStyles();
    const width = fontSizeInEm / 4;

    const handleOnClick = () => {
        if (onClick != null)
            onClick(this, null);
    }

    const parseDigits = () => {
        let arr = Array.from((Number(value).toFixed(decimalPlaces)));
        let numDisplay = arr.length > numberOfDisplayDigit ? arr.length : numberOfDisplayDigit;

        if (decimalPlaces !== 0) {
            arr = Array(numDisplay + 1 - arr.length).fill('', 0, numDisplay - arr.length).concat(arr);
            arr[numDisplay - decimalPlaces] = '.';
        }
        else {
            arr = Array(numDisplay - arr.length).fill('', 0, numDisplay - arr.length).concat(arr);
        }

        return arr;
    }

    return (
        <div className={classes.root} onClick={handleOnClick} >
            {parseDigits(value).map((v, index) => {
                return (
                    <div key={'digit' + index} className={classes.panel} style={{ marginLeft: (width) + 'em', minHeight: '1em' }}>
                        <SevenSegmentDisplayDigit value={v} onColor={onColor} offColor={offColor} fontSizeInEm={fontSizeInEm} />
                    </div>
                )
            })}
        </div>
    )
}

SevenSegmentDisplay.defaultProps = {
    fontSizeInEm: 1.25,
    numberOfDisplayDigit: 1,
    decimalPlaces: 0,
    value: '',
    onColor: 'rgb(32, 217, 32, 1)',
    offColor: 'rgb(40, 44, 57, 0.4)'
};

export default SevenSegmentDisplay;