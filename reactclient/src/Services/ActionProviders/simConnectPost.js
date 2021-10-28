export const simConnectPost = (action, value, executionCount = 1) => {
    let planeProfile = localStorage.getItem('planeProfile');

    if(action === undefined || value === undefined)
        return;

    // ToDo: Check to see if there are any override action

    let data = {action: action.simAction,  actionType: action.type, value: value, executionCount: executionCount, planeProfile: planeProfile };

    console.log(data);

    fetch('/postdata', {
         method: "POST",
         headers: { "Content-type": "application/json; charset=UTF-8" },
         body: JSON.stringify(data)
    })
}

