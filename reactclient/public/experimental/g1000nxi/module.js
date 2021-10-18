var placeHolderParentNodes = [];
var g1000nxiBuggyNodes = [];
var dtkboxBuggyNodeId = [];
var dtkboxBuggyParentNodeId = [];
var socket;
var bodyNodeId;
var headNodeId;
var socketInterval;

window.onload = reportWindowSize;
window.onresize = reportWindowSize;

function reportWindowSize() {
    var Page = document.getElementById('container');
    var zoomLevel = (parseInt(window.innerWidth) / 1024.0 - 1) * 100;
    Page.style.zoom = (100 + zoomLevel).toFixed(2) + '%';
    return false;
}

const start = (pageName) => {
    socketInterval = setInterval(() => {
        connect(pageName);
    }, 2000);
}

const connect = (pageName) => {
    console.log('Connecting to plane...')
    //fetch('http://localhost:19999/pagelist.json')     // if running page directly, need to use browser's disable CORS plugin
    fetch('http://' + window.location.hostname + ':' + window.location.port + '/getdebuggerpagelist')
        .then(
            (response) => { return response.json(); })
        .then(
            data => 
            { 
                if(data !== undefined && data.length > 0)
                {
                    data.forEach(page => {
                        if(page.title.includes(pageName))
                        {
                            // Create WebSocket connection.
                            socket = new WebSocket('ws://' + window.location.hostname + ':19999/devtools/page/' + page.id);
                            
                            socket.onmessage = (msg) => {
                                socketReceivedMessage(msg);
                            };

                            socket.onopen = () => {
                                clearInterval(socketInterval);    // found first node, clear websocket connection retry
                                socketOpened();
                                handleSetup();
                            };                         
                        }
                    });
                }
            }
        ).catch();
}


const handleSetup = () => {
    socket.send(JSON.stringify({id: 3, method: 'DOM.getDocument'}));
    socket.send(JSON.stringify({id: 5, method: 'DOM.pushNodeByPathToFrontend', params: { path: '1,HTML'}}));
}

const handleSetup2 = (nodeId) => {
    // expand all nodes
    socket.send(JSON.stringify({id: 1, method: "DOM.requestChildNodes", params: { nodeId: nodeId, depth: -1 }}));

    // force entire html to refresh
    setTimeout(() => {
        var panel = document.getElementById('panel');
        panel.innerHTML = panel.innerHTML;
    }, 2000)
}

const forceRerender = (elementName, delay = 200) => {
    if(elementName === undefined) return;

    setTimeout(() => {
        var element = document.getElementsByName(elementName)[0];
        if(element !== undefined)
            element.innerHTML = element.innerHTML;
    }, delay);
}

const isPlaceHolderType = (tagName) => {
    if(tagName.toLowerCase() === 'text')
        return false;

    return true;
}

const createRootElement = (data) => {
    var htmlNode = data.root.children[1];
        
    htmlNode.children.forEach(childNode =>
    {
        if(childNode.localName === 'head')
        {
            var headElement = document.getElementsByTagName('head')[0];
            headElement.setAttribute('name', childNode.nodeId);
            headNodeId = childNode.nodeId;
        }
        else if (childNode.localName === 'body')
        {
            var bodyElement = document.getElementsByTagName('body')[0];
            bodyElement.setAttribute('name', childNode.nodeId);
            bodyNodeId = childNode.nodeId;
        }
    })
}

const createElement = (node, createPlaceHolder) => {
    if(node.nodeType === 3)
    {
        if(createPlaceHolder)
        {
            var ph = document.createElement('place-holder');
            ph.setAttribute('name', node.nodeId);
            ph.innerHTML = node.nodeValue;
            return ph;
        }
        
        return node.nodeValue;
    }

    if(node.nodeType === 1)
    {
        var element = document.createElement(node.localName);
        element.setAttribute('name', node.nodeId);
        setElementAttributes(node.nodeId, element, node.attributes);

        var isBuggyNode = g1000nxiBuggyNodes.includes(node.nodeId);
        
        if(node.children !== undefined &&  node.children.length > 0)
        {
            node.children.forEach(childNode => {

                if(isBuggyNode && childNode.localName === 'span')
                {
                    dtkboxBuggyNodeId.push(childNode.children[0]);
                    dtkboxBuggyParentNodeId.push(childNode.nodeId);
                }

                var newElement = createElement(childNode, isPlaceHolderType(node.localName))

                if(typeof newElement === 'string')
                    element.innerHTML = newElement;
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

    console.log('uncoded node type: ' + node.nodeType);
    console.log(node);
    return null;
}

const removeNode = (data) => {
    var node = document.getElementsByName(data.nodeId)[0];
    if(node !== undefined)
        node.remove();
}

const insertNode = (data) => {
    var parent = document.getElementsByName(data.parentNodeId)[0];

    // fix G1000 Nxi bug that update a variable non-stop
    if(g1000nxiBuggyNodes.includes(data.parentNodeId))
    {
        if(parent.innerHTML !== data.node.nodeValue)
        {
            parent.innerHTML = data.node.nodeValue;
        }
        return;
    }

    if (data.node.nodeType === 3) {
        if(isPlaceHolderType(parent.tagName))
        {
            parent.prepend(createElement(data.node, true));
        }
        else
        {
            if(parent.innerHTML !== data.node.nodeValue)
                parent.innerHTML = data.node.nodeValue;
        }
    }
    else if (data.node.nodeType === 1) {
        
        parent.append(createElement(data.node, isPlaceHolderType(parent.tagName)));
    }
}

const characterDataModified = (data) => {

    var element = document.getElementsByName(data.nodeId)[0];

    if(element !== undefined && element.innerHTML !== data.characterData)
        element.innerHTML = data.characterData;
}

const inlineStyleInvalidated = (data) => {
    data.nodeIds.forEach((nodeId) => {
        socket.send(JSON.stringify({id: nodeId, method: 'DOM.getAttributes', params: {nodeId: nodeId }}));
    });
}

const setElementAttributes = (nodeId, element, attributes) => {
        if(attributes !== undefined)
        {
            if(element !== undefined)
            {
                var i = 0;
                while (i < attributes.length) {
                    switch(attributes[i].toLowerCase())
                    {
                        case 'id':
                            element.id = attributes[i + 1];
                            break;
                        case 'src':
                        case 'url':
                        case 'href':
                            var value = attributes[i+1];

                            if(value !== '' || value.includes('coui://'))
                            {
                                value = value.replace('coui://', '');

                                if(value.charAt(0) === '/')
                                    value = value.substring(1);
                            }
                            else {
                                value = 'empty.jpg';
                            }

                            element.setAttribute(attributes[i], value);
                            break;
                        default:
                            element.setAttribute(attributes[i], attributes[i+1])
                    }

                    // Capture g1000nxi buggy nodes
                    if(attributes[i+1].includes('dtk-box') || attributes[i+1].includes('hsi-nav-source') 
                    || attributes[i+1].includes('hsi-nav-sensitivity') || attributes[i+1].includes('hsi-rose-hdg-box') 
                    || attributes[i+1].includes('hsi-map-hdg-box') || attributes[i+1].includes('tas-value'))
                        g1000nxiBuggyNodes.push(nodeId);

                    i = i + 2;
                }
            }
        }
}

const attributeModified = (data) => {
    var node = document.getElementsByName(data.nodeId)[0];
    
    if(node !== undefined)
        setElementAttributes(data.nodeId, node, [data.name, data.value]);
}

const childNodeCountUpdated = (data) => {
    var msg = {
        id: 1,
        method: "DOM.requestChildNodes",
        params: { nodeId: data.nodeId, depth: -1 }
    }
    socket.send(JSON.stringify(msg));
}

const socketOpened = () => {
    console.log('Server connected!');
}

const socketReceivedMessage = (msg) => {
    var data = JSON.parse(msg.data);

    if (data.result !== undefined) 
    {
        if (data.id >= 15) {
            var element = document.getElementsByName(data.id)[0];
            if(element !== undefined)
                setElementAttributes(data.id, element, data.result.attributes);
        }
        else if (data.id === 3) {
            createRootElement(data.result);
        }
        else if (data.id === 5) {
            var rootNodeId = data.result.nodeId;
            handleSetup2(rootNodeId);
        }
        else
        {
            //console.log(data);
        }
    }
    else if (data.method !== undefined) 
    {
        if (data.method == "DOM.inlineStyleInvalidated") {
            inlineStyleInvalidated(data.params);
        }
        else if (data.method == "DOM.attributeModified") {
            attributeModified(data.params);
            forceRerender(data.nodeId);  // force rerender
        }
        else if (data.method === 'DOM.childNodeInserted') {
            if(!dtkboxBuggyParentNodeId.includes(data.params.parentNodeId))
                insertNode(data.params);
            else
            {
                var element = document.getElementsByName(data.params.parentNodeId)[0];

                if (element.innerHTML !== data.params.node.nodeValue)
                    element.innerHTML = data.params.node.nodeValue;
            }
                
        }
        else if (data.method === 'DOM.childNodeRemoved') {
            if(!dtkboxBuggyNodeId.includes(data.params.nodeId))
                removeNode(data.params);
        }
        else if (data.method === "DOM.characterDataModified") {
            characterDataModified(data.params);
        }
        else if (data.method === 'DOM.setChildNodes') {
            var parent = document.getElementsByName(data.params.parentId)[0];

            if(data.params.parentId === headNodeId)
            {
                data.params.nodes = data.params.nodes.filter(childNode => childNode.localName !== 'script' && childNode.localName !== 'title' && childNode.localName !== 'meta' && childNode.localName !== 'style');
            }

            if (parent !== undefined) {
                // only get first child of body tag
                if(data.params.parentId === bodyNodeId)
                    data.params.nodes.length = 1
                
                data.params.nodes.forEach((node) => {
                    parent.append(createElement(node, isPlaceHolderType(parent.tagName)));
                });

                forceRerender(data.params.parentId);  // force rerender
            }
        }
        else if (data.method === 'DOM.childNodeCountUpdated')
        {
            childNodeCountUpdated(data.params);
        }
        else {
            console.log(msg);
        }
    }
    else{
        console.log(msg);
    }
}

