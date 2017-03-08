'use babel';

import * as d3 from 'd3';
import htmlparser from 'htmlparser2';
import DomHandler from 'domhandler';
import TreeVisNodeLink from './treeVisNodeLink';

export default class VisManager {

    constructor() {
        /*
            this class should
              - hold the tree strucutre that the parser creates from the code
              - have access to the different tree visualisation types (node-link, ice, ...)
        */

        this.element = document.createElement('div');
        this.element.classList.add('element');

        this.svg = d3.select(this.element).append('svg');
        this.g = this.svg.append('g');

        this.treeVis = new TreeVisNodeLink(this.svg, this.g);
    }

    updateVis(contents) {
        var width = this.element.clientWidth;
        var height = this.element.clientHeight;

        this.svg.attr('width', width);
        this.svg.attr('height', height);

        parseHtmlString(contents).then( (dom) => {

            //this is just to get the root of the tree
            var html = dom.filter(function(node) {
                if(node.name === 'html') {
                    return true;
                }
            }).pop()

            //this is just to clear everything
            //this.svg.selectAll("*").remove();
            //createNodeLink(this.svg, html);
            this.treeVis.update(html);
        });
    }

    destroy() {
        this.element.remove();
    }

    getElement() {
        return this.element;
    }
}


///
function parseHtmlString(payload) {
    //this is all async
    var promise = new Promise( function(resolve, reject) {

        var handler = new DomHandler( function (error, dom) {
            if (error) {
                log.error(error);
                reject(err);
            }
            else {
                resolve(dom);
            }
        }, { withStartIndices:true, withEndIndices:true } );

        //should this be placed in a different file?
        var parser = new htmlparser.Parser(handler, {recognizeSelfClosing: true, decodeEntities: true});

        parser.write(payload);
        parser.done();
    });

    return promise;
}



function createNodeLink(svg, data) {

    var node_radius = 10;
    var padding = (node_radius)
    var new_height = svg.attr('height');
    var new_width = (svg.attr('width') - (padding * 2)) - padding;

    var g = svg.append('g')
        .attr('transform', (d) => { return `translate(${padding + (padding/2)},${0})` });

    var root = d3.hierarchy(data, HELPERS.fff)
        .sum( function(d) {
            //if node is a leaf node then return 1 else return 0

            return HELPERS.isLeaf(d) ? 1 : 0;
        });

    var tree = d3.tree()
        .size([new_height,new_width])

    tree(root);

    var nodes = root.descendants();

    g.selectAll('path')
        .data(nodes.slice(1))
      .enter().append('path')
        .attr('fill', 'none')
        .attr('stroke', 'white')
        .attr('d', function(d) {
            return "M" + d.y + "," + d.x
                + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                + " " + d.parent.y + "," + d.parent.x;
        });

    g.selectAll('circle')
        .data(nodes)
      .enter().append('circle')
        .attr('fill', function(d) {
                var type = htmlElementType[d.data.name];
                if(type === undefined) {
                    return '#7f7f7f';
                } else {
                    return COLOR[type];
                }
            })
        .attr('stroke', 'white')
        .attr("cx", function(d) { return d.y; })
        .attr("cy", function(d) { return d.x; })
        .attr("r", node_radius);
}

var HELPERS = {
    fff: function(d) {
        //might be a good idea to add an id to the nodes here?
        //for a change animation?
        return d.children.filter( function(o) {
            //console.log(o.type)
            if(o.type === 'tag' || o.type === 'script' || o.type === 'style')
                return true
        })
    },
    isLeaf: function(node) {
        if(node.type === 'script' || node.type === 'style') {
            return true;
        }

        var l = false;

        node.children.forEach(function(child){
            if(child.type !== 'text') {
                l = true;
            }
        })

        if(!l) {
            return true;
        }
    }
}

//https://developer.mozilla.org/en/docs/Web/HTML/Element
var htmlElementType = {
    'html' : 'basic_elements',
    'body': 'basic_elements',
    'base': 'document_metadata',
    'head': 'document_metadata',
    'link': 'document_metadata',
    'meta': 'document_metadata',
    'style': 'document_metadata',
    'title': 'document_metadata',
    'address': 'content_sectioning',
    'article': 'content_sectioning',
    'aside': 'content_sectioning',
    'footer': 'content_sectioning',
    'header': 'content_sectioning',
    'h1': 'content_sectioning',
    'h2': 'content_sectioning',
    'h3': 'content_sectioning',
    'h4': 'content_sectioning',
    'h5': 'content_sectioning',
    'h6': 'content_sectioning',
    'hgroup': 'content_sectioning',
    'nav': 'content_sectioning',
    'dd': 'text_content',
    'div': 'text_content',
    'dl': 'text_content',
    'dt': 'text_content',
    'figcaption': 'text_content',
    'figure': 'text_content',
    'hr': 'text_content',
    'li': 'text_content',
    'main': 'text_content',
    'ol': 'text_content',
    'p': 'text_content',
    'pre': 'text_content',
    'ul': 'text_content',
    'a': 'inline_text_semantics',
    'abbr': 'inline_text_semantics',
    'b': 'inline_text_semantics',
    'bdi': 'inline_text_semantics',
    'bdo': 'inline_text_semantics',
    'br': 'inline_text_semantics',
    'cite': 'inline_text_semantics',
    'code': 'inline_text_semantics',
    'data': 'inline_text_semantics',
    'dfn': 'inline_text_semantics',
    'em': 'inline_text_semantics',
    'i': 'inline_text_semantics',
    'kbd': 'inline_text_semantics',
    'mark': 'inline_text_semantics',
    'q': 'inline_text_semantics',
    'rp': 'inline_text_semantics',
    'rt': 'inline_text_semantics',
    'rtc': 'inline_text_semantics',
    'ruby': 'inline_text_semantics',
    's': 'inline_text_semantics',
    'samp': 'inline_text_semantics',
    'small': 'inline_text_semantics',
    'span': 'inline_text_semantics',
    'strong': 'inline_text_semantics',
    'sub': 'inline_text_semantics',
    'sup': 'inline_text_semantics',
    'time': 'inline_text_semantics',
    'u': 'inline_text_semantics',
    'var': 'inline_text_semantics',
    'wbr': 'inline_text_semantics',
    'area': 'image_and_multimedia',
    'audio': 'image_and_multimedia',
    'map': 'image_and_multimedia',
    'track': 'image_and_multimedia',
    'video': 'image_and_multimedia',
    'img': 'image_and_multimedia',
    'embed': 'embedded_content',
    'object': 'embedded_content',
    'param': 'embedded_content',
    'source': 'embedded_content',
    'canvas': 'scripting',
    'noscript': 'scripting',
    'script': 'scripting',
    'del': 'demarcating_edits',
    'ins': 'demarcating_edits',
    'caption': 'table_content',
    'col': 'table_content',
    'colgroup': 'table_content',
    'table': 'table_content',
    'tbody': 'table_content',
    'td': 'table_content',
    'tfoot': 'table_content',
    'th': 'table_content',
    'thead': 'table_content',
    'tr': 'table_content',
    'button': 'forms',
    'datalist': 'forms',
    'fieldset': 'forms',
    'form': 'forms',
    'input': 'forms',
    'label': 'forms',
    'legend': 'forms',
    'meter': 'forms',
    'optgroup': 'forms',
    'option': 'forms',
    'output': 'forms',
    'progress': 'forms',
    'select': 'forms',
    'textarea': 'forms',
    'details': 'interactive_elements',
    'dialog': 'interactive_elements',
    'menu': 'interactive_elements',
    'menuitem': 'interactive_elements',
    'summary': 'interactive_elements',
    'content': 'web_components',
    'element': 'web_components',
    'shadow': 'web_components',
    'template': 'web_components',
    'acronym': 'obsolete_and_deprecated_elements',
    'applet': 'obsolete_and_deprecated_elements',
    'basefont': 'obsolete_and_deprecated_elements',
    'big': 'obsolete_and_deprecated_elements',
    'blink': 'obsolete_and_deprecated_elements',
    'center': 'obsolete_and_deprecated_elements',
    'command': 'obsolete_and_deprecated_elements',
    'content': 'obsolete_and_deprecated_elements',
    'dir': 'obsolete_and_deprecated_elements',
    'font': 'obsolete_and_deprecated_elements',
    'frame': 'obsolete_and_deprecated_elements',
    'frameset': 'obsolete_and_deprecated_elements',
    'isindex': 'obsolete_and_deprecated_elements',
    'keygen': 'obsolete_and_deprecated_elements',
    'listing': 'obsolete_and_deprecated_elements',
    'marquee': 'obsolete_and_deprecated_elements',
    'multicol': 'obsolete_and_deprecated_elements',
    'nextid': 'obsolete_and_deprecated_elements',
    'noembed': 'obsolete_and_deprecated_elements',
    'plaintext': 'obsolete_and_deprecated_elements',
    'spacer': 'obsolete_and_deprecated_elements',
    'strike': 'obsolete_and_deprecated_elements',
    'tt': 'obsolete_and_deprecated_elements',
    'xmp': 'obsolete_and_deprecated_elements'
}

var COLOR = {
    'basic_elements': '#1776b6',
    'document_metadata': '#ff7f00',
    'content_sectioning': '#26a122',
    'text_content': '#9564bf',
    'inline_text_semantics': '#8d5649',
    'image_and_multimedia': '#e574c3',
    'obsolete_and_deprecated_elements': '#d8231f',
    'scripting': '#c59c93',
    'demarcating_edits': '#bcbf00',
    'table_content': '#05bed0',
    'forms': '#ffbc72',
    'interactive_elements': '#c7c7c7',
    'web_components': '#c5afd6',
    'embedded_content': '#f8b5d2'
}
