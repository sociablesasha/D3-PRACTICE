/**
 * @var SVG
 */
var width = 1000,
    height = 800;



/**
 * @var Event
 */
var drag = null;
var clickSVG = null;
var clickNode = null;
var clickLink = null;
var mousedown = null;
var mouseup = null;
var interval = null;



/**
 * @var Variable
 */
var svg = null;
var node = null;
var link = null;
var nodes = null;
var links = null;



/**
 * @var Menu
 */
var menu_svg = [
    {
        title: 'MAP',
    },
    {
        divider: true
    },
    {
        title: '새로운 맵 생성...',
        action: function (data, index) {
            console.log('Item clicked', 'element:', this, 'data:', data, 'index:', index);
            alert('준비 중입니다.');
        }
    },
    {
        title: '새로운 서브맵 생성...',
        action: function (data, index) {
            console.log('Item clicked', 'element:', this, 'data:', data, 'index:', index);
            alert('준비 중입니다.');
        }
    },
    {
        title: '맵 수정...',
        action: function (data, index) {
            var background = prompt("Background URL");
            $("#topology").css("background-image", "url('" + background + "')");
            test = $("#topology");
            // alert('준비 중입니다.');
        }
    },
    {
        title: '맵 삭제...',
        action: function (data, index) {
            console.log('Item clicked', 'element:', this, 'data:', data, 'index:', index);
            alert('준비 중입니다.');
        }
    },
    {
        title: '맵 저장...',
        action: function (data, index) {
            alert('로그를 확인해주세요!');
            var topologyJSON = new Object;
            topologyJSON.nodes = nodes;

            // Reverse Sort Links
            var linksArray = [];
            links.forEach(function (l) {
                var linkArray = new Object;
                linkArray.source = l.source.id;
                linkArray.value = l.value;
                linkArray.target = l.target.id;
                linksArray.push(linkArray);
            });
            topologyJSON.links = linksArray;
            var jsonData = JSON.stringify(topologyJSON);
            console.log(jsonData);

            // @FIXED AJAX
            function storeTest() {
                $.ajax({
                    url: './serverURL.php',
                    type: 'post',
                    data: jsonData,
                    dataType: "json",
                    success: function (event) {
                    },
                    error: function (event) {
                    }
                });
            }
            console.log(storeTest);
        }
    },
    {
        title: '맵 리프레쉬...',
        action: function (data, index) {
            defaultSetting();
        }
    },
    {
        divider: true
    },
    {
        title: '새로운 자원 추가...',
        action: function (data, index) {
            addingNode();
        }
    },
    {
        title: '자원 전체 삭제...',
        action: function (data, index) {
            removingNodeAll();
        }
    },
    {
        title: '새로운 연결 추가...',
        action: function (data, index) {
            console.log('Item clicked', 'element:', this, 'data:', data, 'index:', index);
            addingLine();
        }
    },
    {
        title: '연결 전체 삭제...',
        action: function (data, index) {
            removingLinkAll();
        }
    }
];
var menu_node = [
    {
        title: 'Node',
    },
    {
        divider: true
    },
    {
        title: '새로운 자원 추가...',
        action: function (data, index) {
            addingNode();
        }
    },
    {
        title: '자원 수정...',
        action: function (data, index) {
            console.log('Item clicked', 'element:', this, 'data:', data, 'index:', index);
            alert('준비 중입니다.');
        }
    },
    {
        title: '자원 삭제...',
        action: function (data, index) {
            removingNode(data);
        }
    },
    {
        title: '자원 전체 삭제...',
        action: function (data, index) {
            removingNodeAll();
        }
    },
    {
        divider: true
    },
    {
        title: '새로운 연결 추가...',
        action: function (data, index) {
            console.log('Item clicked', 'element:', this, 'data:', data, 'index:', index);
            addingLine();
        }
    },
    {
        title: '연결 삭제...',
        action: function (data, index) {
            removingLinkWithNode(data);
        }
    },
    {
        title: '연결 전체 삭제...',
        action: function (data, index) {
            removingLinkAll();
        }
    }
];
var menu_link = [
    {
        title: 'Link',
    },
    {
        divider: true
    },
    {
        title: '새로운 연결 추가...',
        action: function (data, index) {
            console.log('Item clicked', 'element:', this, 'data:', data, 'index:', index);
            alert('준비 중입니다.');
        }
    },
    {
        title: '연결 삭제...',
        action: function (data, index) {
            removingLink(data);
        }
    },
    {
        title: '연결 전체 삭제...',
        action: function (data, index) {
            removingLinkAll();
        }
    }
];



/**
 * @todo default setting
 * @function defaultSetting
 */
function defaultSetting() {
    d3.select(".svg").remove();
    svg = d3.select("#topology").append("svg")
        .attr("class", "svg")
        .attr("width", width)
        .attr("height", height)
        .on('contextmenu', d3.contextMenu(menu_svg, {
            onOpen: function (data, index) { resetOptions(); },
            onClose: function (data, index) { }
        }));
    // Get JSON Object
    d3.json("./Topology.json", function (error, graph) {
        // Define Node Map
        var nodeMap = {};

        // Define Sount Track
        var danger = false;
        var warning = false;

        // Rearrangement
        graph.nodes.forEach(function (d) {
            if (d.icon.indexOf("danger") != -1) {
                danger = true;
            } else if (d.icon.indexOf("warning") != -1) {
                warning = true;
            }
            nodeMap[d.id] = d;
        });
        graph.links.forEach(function (l) {
            if (typeof nodeMap[l.target] === 'undefined') { console.log("l.target undefined id=" + l.target.name); }
            else { l.target = nodeMap[l.target]; }
            if (typeof nodeMap[l.source] === 'undefined') { console.log("l.source undefined id=" + l.source.name); }
            else { l.source = nodeMap[l.source]; }
        });

        // Sound Track
        if (danger) {
            soundPlay("danger");
        } else {
            soundStop("danger");
        }
        if (warning) {
            soundPlay("warning");
        } else {
            soundStop("warning");
        }

        // Set ArrayList
        nodes = graph.nodes;
        links = graph.links;
        drawing();
    });
}



/**
 * @todo manage
 * @function managing
 */
function managing(node) {
    node.x = Math.max(15, Math.min(width - 15, d3.event.x));
    node.y = Math.max(15, Math.min(height - 15, d3.event.y));
    d3.select(this)
        .attr("transform", "translate(" + node.x + "," + node.y + ")");
    svg.selectAll(".link").remove();

    // @FIXED Append -> Insert
    $(links).each(function () {
        var d = this;
        svg
            .insert("path", ".node")
            .attr("class", "link")
            .on('contextmenu', d3.contextMenu(menu_link, {
                onOpen: function (data, index) { resetOptions(); },
                onClose: function (data, index) { }
            }))
            .attr("d", function () {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
            });
    });
}



/**
 * @todo addNode
 * @function addingNode
 * @function addingNodeWithCursor => Event Listen
 */
function addingNode() {
    svg.style("cursor", "copy")
    svg.on("click", addingNodeWithCursor);
}
function addingNodeWithCursor() {
    var node_x = d3.event.x;
    var node_y = d3.event.y;
    var node_name = prompt("node_name");
    var node_object = prompt("object");
    var node_icon = prompt("icon");
    var node_id = Date.now();
    if (node_name != null && node_object != null
        && node_icon != null && node_id != null
        && node_x != null && node_y != null) {
        var data = {
            id: node_id,
            icon: node_icon,
            objtype: node_object,
            name: node_name,
            x: node_x,
            y: node_y
        };
        nodes.push(data);
        node = svg.selectAll(".node");
        node
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .append("image")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .attr('x', -(30 / 2))
            .attr('y', -(30 / 2))
            .attr('width', 30)
            .attr('height', 30)
            .attr("href", function (d) { return d.icon })
            .call(drag)

        nodesContent();
    }
    svg.on("click", null);
}



/**
 * @todo addLine
 * @function addingLine => Create with down, up
 */
var down, up;
function addingLineDown(node) {
    down = node;
}
function addingLineUp(node) {
    up = node;
    addingLine();
}
function addingLine() {
    node = svg.selectAll(".node");
    node
        .call(d3.behavior.drag()
            .origin(function (d) { return d; })
            .on("drag", null))
        .on("mousedown", addingLineDown)
        .on("mouseup", addingLineUp);
    if (down != up) {
        var temp = true;
        links.forEach(function (link) {
            if (link.source == down && link.target == up) {
                temp = false;
            }
        });
        if (temp) {
            var data = {
                source: down,
                value: 2,
                target: up
            };
            links.push(data);
            node
                .on("mousedown", null)
                .on("mouseup", null);
            drawing();
        }
    }
    down = null;
    up = null;
}



/**
 * @todo removeNode
 * @function removingNode
 * @function removingNodeAll
 */
function removingNode(node) {
    // Remove Node
    nodes.splice(nodes.indexOf(node), 1);
    // Remove Link
    var temps = [];
    links.forEach(function (link) {
        if (node.id == link.source.id
            || node.id == link.target.id) {
            temps.push(link);
        }
    });
    temps.forEach(function (temp) {
        links.splice(links.indexOf(temp), 1);
    });
    drawing();
}
function removingNodeAll() {
    nodes.splice(0, nodes.length);
    links.splice(0, links.length);
    drawing();
}



/**
 * @todo removeLink
 * @function removingNode
 * @function removingNodeWithNode
 * @function removingNodeAll
 */
function removingLink(link) {
    // Remove Link
    links.splice(links.indexOf(link), 1);
    drawing();
}
function removingLinkWithNode(node) {
    var temps = [];
    links.forEach(function (link) {
        if (node.id == link.source.id
            || node.id == link.target.id) {
            temps.push(link);
        }
    });
    temps.forEach(function (temp) {
        links.splice(links.indexOf(temp), 1);
    });
    drawing();
}
function removingLinkAll() {
    links.splice(0, links.length);
    drawing();
}



/**
 * @todo reset options (event, css)
 * @function resetOptions
 */
function resetOptions() {
    svg
        .on("click", null)
        .style("cursor", "pointer");
}


/**
 * @todo draw
 * @function drawing
 */
function drawing(options) {
    svg.selectAll(".link").remove();
    svg.selectAll(".node").remove();
    link = svg.selectAll(".link");
    node = svg.selectAll(".node");
    drag = d3.behavior.drag()
        .origin(function (d) { return d; })
        .on("drag", managing);

    link
        .data(links)
        .enter().append("path")
        .attr("class", "link")
        .on('contextmenu', d3.contextMenu(menu_link, {
            onOpen: function (data, index) { resetOptions(); },
            onClose: function (data, index) { }
        }))
        .attr("d", function (d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
        });

    node
        .data(nodes)
        .enter().append("g")
        .attr("id", function (d) {
            return d.id;
        })
        .attr("class", "node")
        .on('contextmenu', d3.contextMenu(menu_node, {
            onOpen: function (data, index) { resetOptions(); },
            onClose: function (data, index) { }
        }))
        .append("image")
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .attr('x', -(30 / 2))
        .attr('y', -(30 / 2))
        .attr('width', 30)
        .attr('height', 30)
        .attr("href", function (d) { return d.icon })
        .call(drag)

    nodesContent();
    linksContent();

}



/**
 * @todo nodesContent
 * @function nodesContent
 */
function nodesContent() {
    $(".active-nodes").remove();
    nodes.forEach(function (data) {
        var node_clone = $("#template_node").clone();
        node_clone.attr("style", "display: block");
        node_clone.addClass("active-nodes");
        // @FIXED Accent in SVG, After Click.
        node_clone.on("click", function () {
            alert(data.id);
            $("#" + data.id).toggleClass("accent");
        });
        node_clone[0].id = data.id;
        node_clone.children()[0].src = data.icon;
        node_clone.children()[1].innerText = data.name;
        $(".nodes").append(node_clone);
    });
}



/**
 * @todo linksContent
 * @function linksContent
 */
function linksContent() {
    $(".active-links").remove();
    links.forEach(function (data) {
        var link_clone = $("#template_link").clone();
        link_clone.attr("style", "display: block");
        link_clone.addClass("active-links");
        link_clone.children()[0].src = "https://image.flaticon.com/icons/svg/126/126481.svg";
        link_clone.children()[1].children[0].id = data.source.id;
        link_clone.children()[1].children[0].firstElementChild.src = data.source.icon;
        link_clone.children()[1].children[0].lastElementChild.innerText = data.source.name;
        link_clone.children()[1].children[1].id = data.target.id;
        link_clone.children()[1].children[1].firstElementChild.src = data.target.icon;
        link_clone.children()[1].children[1].lastElementChild.innerText = data.target.name;
        $(".links").append(link_clone);
    });
}



/**
 * @todo play the sound
 * @function soundPlay
 */
function soundPlay (value) {
    document.getElementById(value).play();
}



/**
 * @todo play the sound
 * @function soundStop
 */
function soundStop (value) {
    document.getElementById(value).pause();
}



/**
 * @todo load
 * @function loading
 */
$(document).ready(function () {
    defaultSetting();
    interval = setInterval(defaultSetting, 15000);
}); 
