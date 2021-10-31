var BUGGY_NODES_CLASSES = [];
var BUGGY_NODES_IDS = [];
var buggyNodes = [];
var replaceMapNode = [];
var htmluiRoot; 

var targetedPlane, socket, socketRetryInterval, garbageBin;
var divElement, textElement, spanElement, placeholderElement, tspanElement;

const start = (planeType, panel) => {
    targetedPlane = planeType.toLowerCase();
    socketRetryInterval = setInterval(() => {
        connect(panel);
    }, 2000);

    window.onresize = resizePanel;

    // setup MSFS html_ui root folder path
    htmluiRoot = '/assets/' + planeType;

    // setup element templates
    divElement = document.createElement('div');
    textElement = document.createElement('text');
    spanElement = document.createElement('span');
    placeholderElement = document.createElement('place-holder');
    tspanElement = document.createElement('tspan');
    
    // create garbage bin
    window.onload = () => {
        garbageBin = document.createElement('div');
        garbageBin.style.display = 'none'; //Make sure it is not displayed
        document.body.appendChild(garbageBin);
    }

    // setup buggy nodes for each plane type
    switch(planeType.toLowerCase()){
        case 'g1000nxi':
            BUGGY_NODES_CLASSES = ['dtk-box', 'hsi-nav-source', 'hsi-nav-sensitivity', 'hsi-rose-hdg-box', 'hsi-map-hdg-box', 'tas-value', 'vertdev-source'];
            BUGGY_NODES_IDS = [];
            break;
        case 'fbwa32nx':
            BUGGY_NODES_CLASSES = ['Title', 'Action', 'Completed', 'Value'];
            BUGGY_NODES_IDS = ['CurrentValue', 'Value', 'SATValue', 'TATValue', 'ISAValue'];
            break;
        case 'cj4':
            BUGGY_NODES_CLASSES = [];
            BUGGY_NODES_IDS = [];
            break;
    }
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
    var body = document.getElementById('container');
    var vcockpit = document.getElementById('panel');

    if(vcockpit !== null) {
        var pageWidth = parseInt(vcockpit.childNodes[0].style.width, 10);
        var pageHeight = parseInt(vcockpit.childNodes[0].style.height, 10);

        var zoomLevelWidth = (parseInt(window.innerWidth) / pageWidth * 1.0 - 1) * 100;
        var zoomLevelHeight = (parseInt(window.innerHeight) / pageHeight * 1.0 - 1) * 100;
        var zoomLevel = zoomLevelWidth < zoomLevelHeight ? zoomLevelWidth : zoomLevelHeight;

        var zoom = (100 + zoomLevel).toFixed(2) + '%';
        body.style.zoom = zoom;
    }

    return false;
}

const socketReceivedMessage = (msg) => {
    var data = JSON.parse(msg.data);

    if (data.result !== undefined) 
    {
        if (data.id >= 10) {
            var element = document.getElementsByName(data.id)[0];
            if(element !== undefined)
                setElementAttributes(element, data.result.attributes);
        }
        else if (data.id === 1) {
            createRootElement(data.result);
        }
        else if (data.id === 2) {
            var rootNodeId = data.result.nodeId;
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
                if(!buggyNodes.includes(data.params.parentNodeId))
                {
                    handleInsertNode(data.params);
                    forceRerender(data.params.parentNodeId);  // force rerender
                }
                else
                {
                    var element = document.getElementsByName(data.params.parentNodeId)[0];
                    buggyNodes.push(data.params.parentNodeId);
                    //buggyNodes.push(data.params.node.nodeId);

                    if (element.innerHTML !== sanitize(data.params.node.nodeValue))
                    {
                        element.innerHTML = sanitize(data.params.node.nodeValue);
                        forceRerender(data.params.parentNodeId);  // force rerender
                    }
                }
                break;
            case 'DOM.childNodeRemoved':
                if(!buggyNodes.includes(data.params.nodeId))
                    removeElement(data.params);
                break;
            case 'DOM.characterDataModified':
                handleCharacterDataModified(data.params);
                break;
            case 'DOM.setChildNodes':
                var parent = document.getElementsByName(data.params.parentId)[0];

                if(data.params.parentId === Number(document.head.getAttribute('name')))
                {
                    data.params.nodes = data.params.nodes.filter(childNode => childNode.localName !== 'script' && childNode.localName !== 'title' && childNode.localName !== 'meta');
                }
    
                if (parent !== undefined) {
                    // only get first child of body tag
                    if(data.params.parentId === Number(document.body.getAttribute('name')))
                        data.params.nodes.length = 1
                    
                    data.params.nodes.forEach((node) => {
                        parent.append(createElement(node, parent.tagName));
                    });
    
                    forceRerender(data.params.parentId);  // force rerender
                }
                break;
            case 'DOM.childNodeCountUpdated':
                handleChildNodeCountUpdated(data.params);
                break;
            case 'DOM.pseudoElementAdded':   
            case 'DOM.pseudoElementRemoved':
            default:
                console.log(data);
        }
    }
    else{
        console.log(data);
    }
}

const forceRerender = (elementName, delay = 50) => {
    if(elementName === undefined) return;

    //setTimeout(() => {
        var element = document.getElementsByName(elementName)[0];
        if(element !== undefined)
            element.innerHTML = element.innerHTML;
    //}, delay);
}

const instantiateElement = (tagName) => {
    switch(tagName)
    {
        case 'div':
            return divElement.cloneNode(true);
        case 'text':
            return textElement.cloneNode(true);
        case 'span':
            return spanElement.cloneNode(true);
        case 'tspan':
            return tspanElement.cloneNode(true);
        case 'place-holder':
            return placeholderElement.cloneNode(true);
        default:
            return document.createElement(tagName);
    }
}

const setupBuggyNodes = () => {
    // capture buggy nodes by html class names
    BUGGY_NODES_CLASSES.forEach(cls => {
        var elements = document.querySelectorAll('.' + cls);

        elements.forEach(element => {
            var elementName = element.getAttribute('name');
            buggyNodes.push(Number(elementName));

            element.childNodes.forEach(c => {
                if(c.getAttribute !== undefined)
                {
                    var childElementName =  c.getAttribute('name');
                    if(childElementName !== undefined)
                        buggyNodes.push(Number(childElementName));

                    c.childNodes.forEach(gc => {
                        if(gc.getAttribute !== undefined)
                        {
                            var gcElementName =  gc.getAttribute('name');
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
        var elements = document.querySelectorAll('#' + id);

        elements.forEach(element => {
            var elementName = element.getAttribute('name');
            buggyNodes.push(Number(elementName));

            element.childNodes.forEach(c => {
                if(c.getAttribute !== undefined)
                {
                    var childElementName =  c.getAttribute('name');
                    if(childElementName !== undefined)
                        buggyNodes.push(Number(childElementName));

                    c.childNodes.forEach(gc => {
                        if(gc.getAttribute !== undefined)
                        {
                            var gcElementName =  gc.getAttribute('name');
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
        var mainFrame = document.getElementById('Mainframe');
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
    var htmlNode = data.root.children[1];
    var htmlElement = document.getElementsByTagName('html')[0]; 
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
        if(parentTag.toLowerCase() === 'text' || parentTag.toLowerCase() === 'tspan')
        {
            if(targetedPlane === 'fbwa32nx' || targetedPlane === 'g1000nxi')        // one off for FBW A32NX and G1000NXi
            {
                var el = instantiateElement('tspan');
                el.setAttribute('name', node.nodeId);
                el.innerHTML = sanitize(node.nodeValue);
                return el;
            }
            else
            {
                return node.nodeValue;
            }
        }
        if(parentTag.toLowerCase() === 'tspan')
        {
            return node.nodeValue;
        }
        else
        {
            var el = instantiateElement('place-holder');
            el.setAttribute('name', node.nodeId);
            el.innerHTML = sanitize(node.nodeValue);
            return el;
        }
    }

    if(node.nodeType === 1)
    {
        if(node.childNodeCount !== undefined && node.childNodeCount >= 1)
        {
            socket.send(JSON.stringify({id: node.nodeId, method: "DOM.requestChildNodes", params: { nodeId: node.nodeId, depth: -1 }}));
        }

        var element = document.createElement(node.localName);
        element.setAttribute('name', node.nodeId);
        setElementAttributes(element, node.attributes);

        // replace bing map node with built-in map app
        if(replaceMapNode.includes(node.nodeId))
        {
            var mapElement = document.createElement('iframe');
            mapElement.setAttribute('src',  `http://${window.location.hostname}:${window.location.port}/mappanel`);
            mapElement.setAttribute('style', 'width:100%; height: calc(100% - 58px); margin-top: 58px');
            mapElement.setAttribute('frameborder', '0');
            
            element.append(mapElement);
            return element;
        }
        
        if(node.children !== undefined &&  node.children.length > 0)
        {
            node.children.forEach(childNode => {

                var newElement = createElement(childNode, node.localName)

                if(typeof newElement === 'string')
                    element.innerHTML = sanitize(newElement);
                else
                    element.append(newElement);
            });
        }

        socket.send(JSON.stringify({id: node.nodeId, method: 'DOM.getAttributes', params: {nodeId: node.nodeId }}));
        return element;
    }

    if (node.nodeType === 8)
    {
        return node.nodeValue;
    }

    return null;
}

const removeElement = (data) => {
    var el = document.getElementsByName(data.nodeId)[0];
    if(el !== undefined)
    {
        //Move the element to the garbage bin element
        garbageBin.appendChild(el);
        garbageBin.innerHTML = "";
    } 
}

const setElementAttributes = (element, attributes) => {
    if(element !== undefined && attributes !== undefined)
    {
        var i = 0;
        while (i < attributes.length) {
            var attribute = attributes[i].toLowerCase();
            var value = attributes[i + 1];
            switch(attribute)
            {
                case 'class':   
                        // scoll highlighted item into view
                    if(value.includes('highlight-select'))
                    {
                        element.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});

                        // fix ipad safari screen shift when scrollIntoView
                        var mainframe = document.getElementById('Mainframe');
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

            element.setAttribute(attribute, value);

            i += 2;
        }
    }
}

const sanitize = (text) => {
    return text.replace('<','&lt;');
}

const handleInsertNode = (data) => {
    var parent = document.getElementsByName(data.parentNodeId)[0];

    if (data.node.nodeType === 3)
    {
        var newElement = createElement(data.node, parent.tagName);
        if(typeof newElement === 'string')
            parent.innerHTML = sanitize(newElement);
        else
            parent.prepend(newElement);
    }
    else if (data.node.nodeType === 1) {
        var newElement = createElement(data.node, parent.tagName);
        if(typeof newElement === 'string')
            parent.innerHTML = sanitize(newElement);
        else
            parent.append(newElement);
    }
}

const handleInlineStyleInvalidated = (data) => {
    data.nodeIds.forEach((nodeId) => {
        socket.send(JSON.stringify({id: nodeId, method: 'DOM.getAttributes', params: {nodeId: nodeId }}));
    });
}

const handleAttributeModified = (data) => {
    var node = document.getElementsByName(data.nodeId)[0];
    
    if(node !== undefined)
        setElementAttributes(node, [data.name, data.value]);
}

const handleAttributeRemoved = (data) => {
    var node = document.getElementsByName(data.nodeId)[0];
    
    if(node !== undefined)
        node.removeAttribute(data.name);
}

const handleCharacterDataModified = (data) => {
    var element = document.getElementsByName(data.nodeId)[0];

    if(element !== undefined && element.innerHTML !== sanitize(data.characterData))
        element.innerHTML = sanitize(data.characterData);
}

const handleChildNodeCountUpdated = (data) => {
    var msg = {
        id: 1,
        method: "DOM.requestChildNodes",
        params: { nodeId: data.nodeId, depth: -1 }
    }
    socket.send(JSON.stringify(msg));
}