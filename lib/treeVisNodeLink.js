'use babel';
import * as d3 from 'd3';

export default class TreeVisNodeLink{
    constructor(svg, g) {
        this.nodeRadius = 10;
        this.padding = 10;

        this.svg = svg;
        this.g = g;

        //this is here so that the links always remain behind the nodes during rendering.
        this.g_links = this.g.append('g').attr('id', 'links');
        this.g_nodes = this.g.append('g').attr('id', 'nodes');
    }

    update(treeData) {
        if(!treeData) {
            this.g.selectAll('*').remove();
            this.g_links = this.g.append('g').attr('id', 'links');
            this.g_nodes = this.g.append('g').attr('id', 'nodes');
            return
        }

        var new_height = this.svg.attr('height');
        var new_width = (this.svg.attr('width') - (this.padding * 2)) - this.padding;

        //center g element in svg
        this.g.attr('transform', (d) => { return `translate(${this.padding + (this.padding/2)},${0})` });

        var root = d3.hierarchy(treeData, HELPERS.childrenFn)

        var id = 0;

        root.sum( function(d) {
            //if node is a leaf node then return 1 else return 0
            return HELPERS.isLeaf(d) ? 1 : 0;
        })
        .each(function(d) {
            d.data.id = id;
            id++;
            //console.log(d)
        });

        var tree = d3.tree()
            .size([new_height,new_width])

        tree(root);

        //----------------------------------------------------------------------
        //----------------------------------------------------------------------

        //Paths update
        //Join new data with old elements
        var paths = this.g_links.selectAll('path')
            .data(root.descendants().slice(1))

        // EXIT old elements not present in new data.
        paths.exit()
            .remove();

        // UPDATE old elements present in new data.
        paths.transition()
            .duration(500)
            .attr('d', function(d) {
                return `M${d.y},${d.x}C${(d.y + d.parent.y) / 2},${d.x} ${(d.y + d.parent.y) / 2},${d.parent.x} ${d.parent.y},${d.parent.x}`;
            })
            .ease(d3.easeLinear);

        // ENTER new elements present in new data.
        paths.enter().append('path')
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .transition()
                .duration(500)
                .attr('d', function(d) {
                    return `M${d.y},${d.x}C${(d.y + d.parent.y) / 2},${d.x} ${(d.y + d.parent.y) / 2},${d.parent.x} ${d.parent.y},${d.parent.x}`;
                })
                .ease(d3.easeLinear);

        //-----
        //-----

        //Nodes update

        //Join new data with old elements
        var nodes = this.g_nodes.selectAll('circle')
            .data(root.descendants(), function(d) {
                return d.data.id;
            });

        // EXIT old elements not present in new data.
        nodes.exit()
            .remove();

        // UPDATE old elements present in new data.
        nodes.transition()
            .attr("cx", function(d) {
                return d.y //this is correct y instead of x
            })
            .attr("cy", function(d) {
                return d.x //this is correct x instead of y
            })
            .duration(500);

        // ENTER new elements present in new data.
        nodes.enter().append('circle')
            .attr('r', function(d) {
               return 10;
            })
            .attr('cx', function(d) {
               return d.y; //this is correct y instead of x
            })
            .attr('cy', function(d) {
               return d.x; //this is correct x instead of y
            })
            .attr('stroke', 'white')
            .attr('fill', function(d) {
                var type = HELPERS.htmlElementType[d.data.name];
                if(type === undefined) {
                    return '#7f7f7f';
                } else {
                    return HELPERS.COLORS[type];
                }
            })
            .on('click', onNodeClick);
    }
}

//------

function onNodeClick(node) {
    //node is d in d3
    console.log(node);
    //node.data.startIndex -- need to convert to cols and rows
    //node.data.endIndex   -- need to convert to cols and rows

    //send event to ediotr to highlight the soecfic lines of code that the node correspondes to!
    // just send index to the ediotor Manager and conversion calculation will be done there
}

var HELPERS = {
    childrenFn: function(d) {
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
    },
    htmlElementType: { //https://developer.mozilla.org/en/docs/Web/HTML/Element
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
    },
    COLORS: {
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
}
