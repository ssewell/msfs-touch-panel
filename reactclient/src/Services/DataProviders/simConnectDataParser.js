import { simconnectDataType } from './simConnectDataType';
import { simConnectDataTypeDefault } from './simConnectDataTypeDefault';
import { simConnectDataTypeFormat, formattingMethod} from './simConnectDataTypeFormat';

export const initializeDataContainer = (initialData) => {
    let container = initialData;

    // create data container by looping through simconnectDataType constant and setup intial state
    for (const [dataKey, ] of Object.entries(simconnectDataType)) {

        // Specify default value as needed from simConnectDataTypeDefault.js file
        if(Object.keys(simConnectDataTypeDefault).indexOf(dataKey) > -1)
            container[dataKey] = simConnectDataTypeDefault[dataKey];
        else
            container[dataKey] = 0;
    }

    return container;
}

export const parseRequestData = (resultData, resultLVarData) => {
    if(resultData === [] && resultLVarData === []) return [];

    let newData = [];
    let newValue, applyFunc;
  
    // Loop through simconnectDataType constant and replace data value from new requested data as needed
    for (const [dataKey, simKey] of Object.entries(simconnectDataType)) {
        
        if(resultData != null && resultData[simKey] !== undefined)
        {
            newValue = resultData[simKey];
            
            // Format value as specified by the data key as needed
            if(Object.keys(simConnectDataTypeFormat).indexOf(dataKey) > -1)
            {
                applyFunc = simConnectDataTypeFormat[dataKey];  // get function to apply
                newValue = formattingMethod[applyFunc](newValue);
            }

            newData[dataKey] = newValue;
        }

        if(resultLVarData !== null && resultLVarData[simKey] !== undefined)
        {
            newValue = resultLVarData[simKey];
            
            // Format value as specified by the data key as needed
            if(Object.keys(simConnectDataTypeFormat).indexOf(dataKey) > -1)
            {
                applyFunc = simConnectDataTypeFormat[dataKey];  // get function to apply
                newValue = formattingMethod[applyFunc](newValue);
            }

            newData[dataKey] = newValue;
        }
    }

    return newData;
}