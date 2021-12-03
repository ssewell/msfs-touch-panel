let BUGGY_NODES_CLASSES = [];
let BUGGY_NODES_IDS = [];
let buggyNodes = [];
let replaceMapNode = [];
let htmluiRoot; 

let targetedPlane, targetPanel, socket, socketRetryInterval;

const start = (planeType, panel) => {
    targetedPlane = planeType.toLowerCase();
    targetedPanel = panel.toLowerCase();
    socketRetryInterval = setInterval(() => {
        connect(panel);
    }, 2000);

    window.onresize = resizePanel;

    // setup MSFS html_ui root folder path
    htmluiRoot = '/assets/' + planeType;

    // setup buggy nodes for each plane type
    switch(planeType.toLowerCase()){
        case 'g1000nxi':
            BUGGY_NODES_CLASSES = ['dtk-box', 'hsi-nav-source', 'hsi-nav-sensitivity', 'hsi-rose-hdg-box', 'hsi-map-hdg-box', 'tas-value', 'vertdev-source'];
            BUGGY_NODES_IDS = [];
            break;
        case 'fbwa32nx':
            //BUGGY_NODES_CLASSES = ['Title', 'Action', 'Completed'];
            BUGGY_NODES_IDS = ['CurrentValue', 'Value', 'SATValue', 'TATValue', 'ISAValue' ];
            break;
        case 'cj4':
            BUGGY_NODES_CLASSES = [];
            BUGGY_NODES_IDS = [];
            break;
    }

    setInterval(() => {
        let garbageBin = document.getElementById('garbageBin');
        console.log('garbageBin length..............................................' + garbageBin.children.length);
        if(garbageBin.children.length > 0)
        {
            for(let i = garbageBin.children.length - 1; i >= 0; i--)
                garbageBin.removeChild(garbageBin.children[i]);
        }
    }, 5000);
}


const connect = (panel) => {
    console.log('Connecting to plane...')
    //fetch('http://localhost:19999/pagelist.json')     // if running page directly, need to use browser's disable CORS plugin
    fetch('http://' + window.location.hostname + ':' + window.location.port + '/getdebuggerpagelist')
        .then(
            (response) => { 
                if(response.status === 200)
                    return response.json(); 
            })
        .then(
            data => 
            { 
                if(data !== undefined && data.length > 0)
                {
                    data.forEach(page => {
                        if(page.title.toLowerCase().includes(panel.toLowerCase()))
                        {
                            // Create WebSocket connection.
                            socket = new WebSocket('ws://' + window.location.hostname + ':19999/devtools/page/' + page.id);
                            
                            socket.onmessage = (msg) => socketReceivedMessage(msg);

                            socket.onopen = () => {
                                console.log('Server connected!');
                                clearInterval(socketRetryInterval);    // found first node, clear websocket connection retry
                                getDocument();
                            };                         
                        }
                    });
                }
            }
        ).catch();
}

const resizePanel = () => {
    let body = document.getElementById('container');
    let vcockpit = document.getElementById('panel');

    if(vcockpit !== null) {
        let pageWidth = parseInt(vcockpit.childNodes[0].style.width, 10);
        let pageHeight = parseInt(vcockpit.childNodes[0].style.height, 10);

        let zoomLevelWidth = (parseInt(window.innerWidth) / pageWidth * 1.0 - 1) * 100;
        let zoomLevelHeight = (parseInt(window.innerHeight) / pageHeight * 1.0 - 1) * 100;
        let zoomLevel = zoomLevelWidth < zoomLevelHeight ? zoomLevelWidth : zoomLevelHeight;

        let zoom = (100 + zoomLevel).toFixed(2) + '%';
        body.style.zoom = zoom;
    }

    return false;
}

const socketReceivedMessage = (msg) => {
    let data = JSON.parse(msg.data);

    if (data.result !== undefined) 
    {
        if (data.id >= 10) {
            setElementAttributes(getElementsByName(data.id), data.result.attributes);
        }
        else if (data.id === 1) {
            createRootElement(data.result);
        }
        else if (data.id === 2) {
            let rootNodeId = data.result.nodeId;
            createDocument(rootNodeId);
        }
    }
    else if (data.method !== undefined) 
    { 
        switch(data.method)
        {
            case 'DOM.inlineStyleInvalidated':
                handleInlineStyleInvalidated(data.params);
                break;
            case 'DOM.attributeModified':
                handleAttributeModified(data.params);
                forceRerender(data.nodeId);  // force rerender
                break;
            case 'DOM.attributeRemoved':
                handleAttributeRemoved(data.params);
                forceRerender(data.nodeId);  // force rerender
                break;
            case 'DOM.childNodeInserted':
                if(buggyNodes.find(x => x == data.params.parentNodeId) === undefined)
                {
                    handleInsertNode(data.params);
                    forceRerender(data.params.parentNodeId);  // force rerender
                }
                else
                {
                    let element = getElementsByName(data.params.parentNodeId);
                    if(buggyNodes.indexOf(data.params.parentNodeId) === -1)
                    {
                        buggyNodes.push(data.params.parentNodeId);
                        //buggyNodes.push(data.params.node.nodeId);
                    }

                    if (element.textContent !== data.params.node.nodeValue)
                    {
                        element.textContent = data.params.node.nodeValue;
                    }
                }
                break;
            case 'DOM.childNodeRemoved':
                if(buggyNodes.find(x => x == data.params.parentNodeId) === undefined)
                    removeElement(data.params);
                break;
            case 'DOM.characterDataModified':
                handleCharacterDataModified(data.params);
                break;
            case 'DOM.setChildNodes':
                let parent = getElementsByName(data.params.parentId);
                data.params.nodes = data.params.nodes.filter(childNode => childNode.localName !== 'script' && childNode.localName !== 'title' && childNode.localName !== 'meta');
    
                if (parent !== undefined) {
                    // only get first child of body tag
                    if(data.params.parentId === Number(document.body.getAttribute('name')))
                        data.params.nodes.length = 1;
                    
                    data.params.nodes.forEach((node) => {
                        parent.appendChild(createElement(node, parent.tagName));
                    });
    
                    forceRerender(data.params.parentId);  // force rerender
                }
                break;
            case 'DOM.childNodeCountUpdated':
                handleChildNodeCountUpdated(data.params);
                break;
            case 'DOM.pseudoElementAdded':   
            case 'DOM.pseudoElementRemoved':
                break;
            default:
                console.log(data);
        }
    }
}

const forceRerender = (elementName) => {
    if(elementName === undefined) return;

    let element = getElementsByName(elementName);
    if(element !== undefined)
        element.innerHTML += '';
}

const setupBuggyNodes = () => {
    // capture buggy nodes by html class names
    BUGGY_NODES_CLASSES.forEach(cls => {
        let elements = document.querySelectorAll('.' + cls);

        elements.forEach(element => {
            let elementName = element.getAttribute('name');
            buggyNodes.push(Number(elementName));

            element.childNodes.forEach(c => {
                if(c.getAttribute !== undefined)
                {
                    let childElementName =  c.getAttribute('name');
                    if(childElementName !== undefined)
                        buggyNodes.push(Number(childElementName));

                    c.childNodes.forEach(gc => {
                        if(gc.getAttribute !== undefined)
                        {
                            let gcElementName =  gc.getAttribute('name');
                            if(gcElementName !== undefined)
                                buggyNodes.push(Number(gcElementName));
                        }
                    })
                }
            })
        })
    });

    // capture buggy nodes by html element id
    BUGGY_NODES_IDS.forEach(id => {
        let elements = document.querySelectorAll('#' + id);

        elements.forEach(element => {
            let elementName = element.getAttribute('name');
            buggyNodes.push(Number(elementName));

            element.childNodes.forEach(c => {
                if(c.getAttribute !== undefined)
                {
                    let childElementName =  c.getAttribute('name');
                    if(childElementName !== undefined)
                        buggyNodes.push(Number(childElementName));

                    c.childNodes.forEach(gc => {
                        if(gc.getAttribute !== undefined)
                        {
                            let gcElementName =  gc.getAttribute('name');
                            if(gcElementName !== undefined)
                                buggyNodes.push(Number(gcElementName));
                        }
                    })
                }
            })
        })
    });
}

const getDocument = () => {
    socket.send(JSON.stringify({id: 1, method: 'DOM.getDocument'}));
    socket.send(JSON.stringify({id: 2, method: 'DOM.pushNodeByPathToFrontend', params: { path: '1,HTML'}}));
}

const createDocument = (nodeId) => {
    // expand all nodes
    socket.send(JSON.stringify({id: 3, method: "DOM.requestChildNodes", params: { nodeId: nodeId, depth: -1 }}));

    setTimeout(() => {
        resizePanel();

        // fix g1000nxi scolling highlighted item into view causes entire page to move
        let mainFrame = document.getElementById('Mainframe');
        if(mainFrame !== null) 
            mainFrame.setAttribute('style', 'overflow: clip');

        // setup buggy nodes to change how the nodes are updated
        setupBuggyNodes();
    }, 1000)

    // Set interval to reset buggy nodes
    setInterval(() => {
        buggyNodes.length = 0;
        setupBuggyNodes();
    }, 30000);
}

const createRootElement = (data) => {
    let htmlNode = data.root.children[1];
    let htmlElement = $('html')[0]; 
    setElementAttributes(htmlElement, htmlNode.attributes);
        
    htmlNode.children.forEach(childNode =>
    {
        if(childNode.localName === 'head')
        {
            document.head.setAttribute('name', childNode.nodeId);
        }
        else if (childNode.localName === 'body')
        {
            document.body.setAttribute('name', childNode.nodeId);
        }
    })
}

const createElement = (node, parentTag) => {
    if(node.nodeType === 3)
    {
        if(targetedPlane === 'fbwa32nx' && targetedPanel === 'eicas_1') // one off for FBW A32NX and EICAS_1
        {
            return node.nodeValue;
        }

        if(parentTag.toLowerCase() === 'text' || parentTag.toLowerCase() === 'tspan')
        {
            if(targetedPlane === 'fbwa32nx' || targetedPlane === 'g1000nxi')        // one off for FBW A32NX and G1000NXi
            {
                let el = document.createElement('tspan');
                el.setAttribute('name', node.nodeId);
                el.textContent = node.nodeValue;
                return el;
            }
            
            return node.nodeValue;
        }

        let el = document.createElement('place-holder');
        el.setAttribute('name', node.nodeId);
        el.textContent = node.nodeValue;
        return el;
    }

    if(node.nodeType === 1)
    {
        if(node.childNodeCount !== undefined && node.childNodeCount >= 1)
        {
            socket.send(JSON.stringify({id: node.nodeId, method: "DOM.requestChildNodes", params: { nodeId: node.nodeId, depth: -1 }}));
        }

        let element = document.createElement(node.localName);
        element.setAttribute('name', node.nodeId);
        setElementAttributes(element, node.attributes);

        // replace bing map node with built-in map app
        if(replaceMapNode.includes(node.nodeId))
        {
            let mapElement = document.createElement('iframe');
            mapElement.setAttribute('src',  `http://${window.location.hostname}:${window.location.port}/mappanel`);
            mapElement.setAttribute('style', 'width:100%; height: calc(100% - 58px); margin-top: 58px');
            mapElement.setAttribute('frameborder', '0');
            
            element.append(mapElement);
            return element;
        }
        
        if(node.children !== undefined && node.children.length > 0)
        {
            node.children = node.children.filter(n => n.localName !== 'script');
            node.children.forEach(childNode => {
                let newElement = createElement(childNode, node.localName)

                if(typeof newElement === 'string')
                    element.textContent = newElement;
                else
                    element.append(newElement);
            
            });
        }

        if(targetedPlane === 'fbwa32nx' && targetedPanel === 'eicas_1')     // one off for FBW A32NX and EICAS_1
        {
            return element;
        }
        else{
            socket.send(JSON.stringify({id: node.nodeId, method: 'DOM.getAttributes', params: {nodeId: node.nodeId }}));
            return element;
        }
    }

    if (node.nodeType === 8)
    {
        return node.nodeValue;
    }

    return null;
}

const modifiedElement  = (node, parentTag) => {

}

const removeElement = (data) => {
    let node = getElementsByName(data.nodeId);
    let parentNode = getElementsByName(data.parentNodeId);
    
    if(node !== undefined)
    {
        if(targetedPlane === 'fbwa32nx' && targetedPanel === 'cdu')     // one off for FBWA32NX CDU. Constant adding and removing of nodes cause flickering. This fix has some performance penalty.
        {
            node.setAttribute('deleted', 'true');
            node.style.display = 'none';
            moveNodetoGarbageBin(data.parentNodeId);        
        }
        else
        {
            parentNode.removeChild(node);
        }
    }

    delete node;
}

const moveNodetoGarbageBin = (nodeId) => {

    let deletedNodes = $('[name=' + nodeId + ']').find('[deleted=true]');
    for(let i = 0; i < deletedNodes.length; i++)
    {
        let childNodeId = deletedNodes[i].getAttribute('name');

        if(IsAllChildrenDeleted(childNodeId))
        {
            let deletedNode = getElementsByName(childNodeId);
            deletedNode.removeAttribute('deleted');
            let garbageBin = document.getElementById('garbageBin');
            garbageBin.appendChild(deletedNode);
        }
    }
}

const IsAllChildrenDeleted = (nodeId) => {
    let node = $('[name=' + nodeId + ']')[0];
    if(node.children.length === 0)
        return true;
    
    for(let i = 0; i < node.children.length; i++)
    {
        console.log(node.children[i].getAttribute('name'));
        if(!IsAllChildrenDeleted(node.children[i].getAttribute('name')))
        {
            console.log(node.children[i].getAttribute('name') + ':false');
            return false;
        }
    }

    return true;
}


const setElementAttributes = (element, attributes) => {
    if(element !== undefined && attributes !== undefined)
    {
        let i = 0;
        while (i < attributes.length) {
            let attribute = attributes[i].toLowerCase();
            let value = attributes[i + 1];
            switch(attribute)
            {
                case 'class':   
                    // scoll highlighted item into view
                    if(value.includes('highlight-select'))
                    {
                        element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});

                        // fix ipad safari screen shift when scrollIntoView
                        let mainframe = document.getElementById('Mainframe');
                        if(mainframe !== null)
                            setTimeout(() => mainframe.scrollIntoView({block: 'start', inline: 'end'}), 1000);
                    }
                    else if (value.includes('mfd-navmap') || value.includes('mfd-fplmap'))  // replace MFD bing map with map from app
                    {
                        replaceMapNode.push(Number(element.getAttribute('name')));
                    }
                    break;
                case 'src':
                case 'url':
                case 'href':
                    if(value === '' || value.includes('JS_BINGMAP'))
                    {
                        value = '/assets/empty.png';
                    }
                    else
                    {
                        if(value.toLowerCase().startsWith('/pages'))
                            value = value.toLowerCase().replace(/\/pages/gi, 'html_ui/pages');

                        value = value.replace('coui://', '');
                        value = value.replace(/html_ui/gi, htmluiRoot + '/html_ui');
                        value = value.replace(/scss/gi, 'assets/shared/scss');
                    }
                    break;
                case 'xlink:href':
                    value = value.replace(/Images/gi, 'assets/shared/images/');
                    break;
                default:
            }

            if(element.getAttribute(attribute) !== value)
                element.setAttribute(attribute, value);
            
            i += 2;
        }
    }
}

const handleInsertNode = (data) => {
    let parent = getElementsByName(data.parentNodeId);

    if (data.node.nodeType === 3)
    {
       if(data.node.nodeValue.match(/{(.*?)}/)) return;   // ignore messed up data issue in fbwA32nx CDU  (eg. {cyan}113{end}{small}   {end} F={green}131{end})

        let newElement = createElement(data.node, parent.tagName);
        if(typeof newElement === 'string') {
            if(parent.textContent !== newElement)
                parent.textContent = newElement;

            // remove element after insert to prevent flickering
            // let reusedElement = $('[name=' + data.parentNodeId + ']').find('[deleted=true]').next();
            // let garbageBin = document.getElementById('garbageBin');
            // garbageBin.appendChild(reusedElement[0]);
        }
        else
        {
            parent.append(newElement);
        }


    }
    else if (data.node.nodeType === 1) {
        let newElement = createElement(data.node, parent.tagName);
        if(typeof newElement === 'string'){
            if(parent.textContent !== newElement)
                parent.textContent = newElement;
        }
        else
            parent.append(newElement);
    }
}

handleModifiedNode = (data) => {
    let parent = getElementsByName(data.parentNodeId);

    if (data.node.nodeType === 3)
    {
        if(data.node.nodeValue.match(/{(.*?)}/)) return;   // ignore messed up data issue in fbwA32nx CDU  (eg. {cyan}113{end}{small}   {end} F={green}131{end})

        let reusedElement = $('[deleted=true]').next();

    }
}

const handleInlineStyleInvalidated = (data) => {
    data.nodeIds.forEach((nodeId) => {
        socket.send(JSON.stringify({id: nodeId, method: 'DOM.getAttributes', params: {nodeId: nodeId }}));
    });
}

const handleAttributeModified = (data) => {
    let node = getElementsByName(data.nodeId);
    
    if(node !== undefined)
        setElementAttributes(node, [data.name, data.value]);
}

const handleAttributeRemoved = (data) => {
    let node = getElementsByName(data.nodeId);
    
    if(node !== undefined)
        node.removeAttribute(data.name);
}

const handleCharacterDataModified = (data) => {
    let element = getElementsByName(data.nodeId);

    if(element !== undefined && element.textContent !== data.characterData)
        element.textContent = data.characterData;
}

const handleChildNodeCountUpdated = (data) => {
    let msg = {
        id: 1,
        method: "DOM.requestChildNodes",
        params: { nodeId: data.nodeId, depth: -1 }
    }
    socket.send(JSON.stringify(msg));
}

const getElementsByName = (nodeId) => {

    return $('[name=' + nodeId + ']')[0];
}