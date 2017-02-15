/*
 * base64.js - Base64 encoding and decoding functions
 *
 * See: http://developer.mozilla.org/en/docs/DOM:window.btoa
 *      http://developer.mozilla.org/en/docs/DOM:window.atob
 *
 * Copyright (c) 2007, David Lindquist <david.lindquist@gmail.com>
 * Released under the MIT license
 */

if (typeof btoa == 'undefined') {
    function btoa(str) {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        var encoded = [];
        var c = 0;
        while (c < str.length) {
            var b0 = str.charCodeAt(c++);
            var b1 = str.charCodeAt(c++);
            var b2 = str.charCodeAt(c++);
            var buf = (b0 << 16) + ((b1 || 0) << 8) + (b2 || 0);
            var i0 = (buf & (63 << 18)) >> 18;
            var i1 = (buf & (63 << 12)) >> 12;
            var i2 = isNaN(b1) ? 64 : (buf & (63 << 6)) >> 6;
            var i3 = isNaN(b2) ? 64 : (buf & 63);
            encoded[encoded.length] = chars.charAt(i0);
            encoded[encoded.length] = chars.charAt(i1);
            encoded[encoded.length] = chars.charAt(i2);
            encoded[encoded.length] = chars.charAt(i3);
        }
        return encoded.join('');
    }
}

function getActiveOption(opts) {
    if (opts.length == 0) return null;
    var opt = opts[0];
    for (var i = 0; i < opts.length; i++) {
        if (opts[i].active) opt = opts[i];
        break;
    }
    return opt;
}

var DropDown = React.createClass({displayName: 'DropDown',
    mixins: [React.addons.PureRenderMixin],
    getInitialState: function () {
        return {
            active: false,
            active_option: getActiveOption(this.props.options) || this.props.placeholder
        };
    },
    remove_background_callback: function () {
        document.removeEventListener('click', this.documentClickHandler);
    },
    add_background_callback: function () {
        document.addEventListener('click', this.documentClickHandler);
    },
    documentClickHandler: function (e) {
        this.setState({
            active: false
        });
    },
    toggleDropDown: function(e) {
        if (arguments.length > 0) {
            e.stopImmediatePropagation();
        }
        if (this.state.active) {
            this.remove_background_callback();
        } else {
            this.add_background_callback();
        }

        this.setState({
            active: this.state.active ? false : true
        });
    },
    set_dropdown_item: function (option) {
        if (this.state.active_option.value != option.value) {
            this.setState({"active_option": option});
        }
    },
    choose_dropdown_item: function (option) {
        this.toggleDropDown();
        if (this.state.active_option.value != option.value) {
            this.set_dropdown_item(option);
            this.props.onChange(option);
        }
    },
    dropdown_click: function (e) {
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        this.toggleDropDown();
    },
    render: function () {
        var active_option_name = null;
        var options = this.props.options.map( function (op, i) {
            var cb = function (e) {
                e.stopPropagation();
                e.nativeEvent.stopImmediatePropagation();
                this.choose_dropdown_item(op);
            }.bind(this);
            var is_active = op.value == this.state.active_option.value;
            if (is_active) {
                active_option_name = op.name;
            }
            return (
                React.createElement("li", {key: "op_" + i, onClick: cb},
                    React.createElement("a", {className: is_active ? "active" : ""}, op.name)
                )
            );
        }.bind(this));
        return (
            React.createElement("li", null,
                React.createElement("a", {className: "dropdown-button",
                   href: "#!",
                   onClick: this.dropdown_click},
                   active_option_name,
                   React.createElement("i", {className: "mdi-navigation-arrow-drop-down right"})
                ),
                React.createElement("ul", {className: "dropdown-inner" + (this.state.active ? " active" : ""), ref: "dropdown"},
                    options
                )
            )
        );
    }
});

function Toolbox () {
    this.selection = null;

    this.width_element  = null;
    this._width         = 60;
    this.height_element = null;
    this._height        = 60;
    this.radius_element = null;
    this._radius        = 30;
    this.shape_element  = null;
    this.shape_element_react = null;

    this.height = function(_) {
        if (arguments.length) {
            this._height = _;
            if (this.selection && this.selection.nodeType != TEXT_NODE_T)
                this.selection.height = this._height;
            if (this.height_element)
                this.height_element.value = this._height;
            return this;
        }
        return this._height;
    }
    this.radius = function(_) {
        if (arguments.length) {
            this._radius = _;
            if (this.selection && this.selection.nodeType != TEXT_NODE_T)
                this.selection.radius = this._radius;
            if (this.radius_element)
                this.radius_element.value = this._radius;
            return this;
        }
        return this._radius;
    }
    this.width = function(_) {
        if (arguments.length) {
            this._width = _;
            if (this.selection && this.selection.nodeType != TEXT_NODE_T)
                this.selection.width = this._width;
            if (this.width_element)
                this.width_element.value = this._width;
            return this;
        }
        return this._width;
    }

    this.shape = function(_) {
        if (arguments.length) {
            this._shape = _;
            if (this.selection && this.selection.nodeType != this._shape) {
                this.selection.nodeType = this._shape;
            }
            if (this.shape_element_react) {
                this.shape_element_react.set_dropdown_item({
                    value: this._shape
                });
            }
            return this;
        }
        return this._shape;
    }
}

function OnChange(el, cb) {
    if(window.addEventListener) {
        el.addEventListener('change', cb, false);
    } else if (window.attachEvent){
        el.attachEvent("onchange", cb);
    }
}

Toolbox.prototype.set_width_element = function (el) {
    var toolbox = this;
    toolbox.width_element = el;
    toolbox.width_element.value = toolbox._width;
    toolbox.width_element.disabled = true;

    OnChange(toolbox.width_element, function (e) {
        toolbox.width(parseInt(this.value));
        draw();
    });
};

Toolbox.prototype.set_height_element = function (el) {
    var toolbox = this;
    toolbox.height_element = el;
    toolbox.height_element.value = toolbox._height;
    toolbox.height_element.disabled = true;

    OnChange(toolbox.height_element, function (e) {
        toolbox.height(parseInt(this.value));
        draw();
    });
};

Toolbox.prototype.set_shape_element = function (el) {
    var toolbox = this;
    toolbox.shape_element = el;

    var options = [
        {value: CIRCLE_NODE_T, name: "circle"},
        {value: ACCEPT_STATE_NODE_T, name: "accept node"},
        {value: RECTANGLE_NODE_T, name: "rectangle"},
        {value: TRIANGLE_NODE_T, name: "triangle"},
        {value: TEXT_NODE_T, name: "text"}
    ];
    toolbox.shape_element_react = React.render(
        React.createElement(DropDown,
            {
                options: options,
                onChange: function (opname) {
                    toolbox.shape(opname.value);
                    draw();
                }
            }
        ),
        toolbox.shape_element
    );
};

Toolbox.prototype.set_radius_element = function (el) {
    var toolbox = this;
    toolbox.radius_element = el;
    toolbox.radius_element.value = toolbox._radius;
    toolbox.radius_element.disabled = true;

    OnChange(toolbox.radius_element, function (e) {
        toolbox.radius(parseInt(this.value));
        draw();
    });
};

Toolbox.prototype.selectObject = function (selection) {
    this.selection = selection;
    this.radius(selection.radius);
    this.width(selection.width);
    this.height(selection.height);
    this.shape(selection.nodeType);
    this.enable_tools();
};

Toolbox.prototype.disable_tools = function () {
    if (this.radius_element)
        this.radius_element.disabled = true;
    if (this.width_element)
        this.width_element.disabled = true;
    if (this.height_element)
        this.height_element.disabled = true;
}

Toolbox.prototype.enable_tools = function () {
    if (this.selection && this.selection.nodeType === TEXT_NODE_T) {
        return;
    }
    if (this.radius_element)
        this.radius_element.disabled = false;
    if (this.width_element)
        this.width_element.disabled = false;
    if (this.height_element)
        this.height_element.disabled = false;
}

Toolbox.prototype.unselect = function () {
    this.selection = null;
    this.disable_tools();
};

var prev_onload = window.onload || function () {},
    toolbox;


var prev_select_object = selectObject;

selectObject = function (x, y) {
    var selection = prev_select_object(x,y);

    if (selection) {
        toolbox.selectObject(selection);
    } else {
        toolbox.unselect();
    }
    return selection;
};

var old_set_new_radius = Node.prototype.setNewRadius;

Node.prototype.setNewRadius = function (x,y) {
    old_set_new_radius.bind(this)(x,y);
    if (toolbox.selection == this) {
        toolbox.height(this.height);
        toolbox.width(this.width);
        toolbox.radius(this.radius);
    }
};

window.onload = function () {
    var toolbox_el = document.getElementsByClassName("toolbox")[0];
    if (toolbox_el) {
        toolbox = new Toolbox();
        var radius_node = toolbox_el.getElementsByClassName("radius");
        if (radius_node)
            toolbox.set_radius_element(radius_node[0]);

        var height_node = toolbox_el.getElementsByClassName("height");
        if (height_node)
            toolbox.set_height_element(height_node[0]);

        var width_node = toolbox_el.getElementsByClassName("width");
        if (width_node)
            toolbox.set_width_element(width_node[0]);

        var shape_node = toolbox_el.getElementsByClassName("shape");
        if (shape_node)
            toolbox.set_shape_element(shape_node[0]);
    }
    prev_onload();
};

