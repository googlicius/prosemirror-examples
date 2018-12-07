import { toggleMark, setBlockType, wrapIn, chainCommands } from "prosemirror-commands";
import { canInsert, markActive, selectHeading, enableHeading } from './menu-item-utils';
import { MenuItem, icons } from 'prosemirror-menu';
import { NodeType } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { wrapInList } from "prosemirror-schema-list";
// import { canInsert } from 'prosemirror-utils';

/**
 * insert image item
 * @param {NodeType} nodeType 
 */
export function insertImageItem(nodeType, options) {
    return new MenuItem({
        ...options,
        enable: state => canInsert(state, nodeType),
        run(state, _, view) {
            const cmd = (url) => {
                console.log("Run command to change the view that display the uploaded image.");
                const data = state.doc.toJSON();
                console.log(JSON.stringify(data))
            }
            console.log("Open modal for uploading image");
            setTimeout(() => cmd("url"), 500);
        }
    })
}

/**
 * insert image item
 * @param {NodeType} nodeType 
 */
export function insertVideoItem(nodeType, options) {
    return new MenuItem({
        ...options,
        enable: state => canInsert(state, nodeType),
        run(state, _, view) {
            // ...
        }
    })
}

/**
 * insert a new part item
 * @param {NodeType} nodeType 
 */
export function horizonRuleItem(nodeType, options) {
    return new MenuItem({
        ...options,
        enable: state => canInsert(state, nodeType),
        run(state, dispatch) {
            const selectedNode = state.selection.$from.node(1);
            const lastChild = state.doc.lastChild;
            const tr = state.tr;
            if(lastChild.eq(selectedNode)) {
                tr.insert(state.selection.from - 1, nodeType.create());
            }
            else {
                tr.replaceSelectionWith(nodeType.create());
            }
            dispatch(tr.scrollIntoView());
        }
    });
}

/**
 * Build a dropcap on selected block.
 * 
 * @param {NodeType} nodeType 
 * @param {*} options 
 */
export function makeDropcap(nodeType, options) {
    return new MenuItem({
        ...options,
        enable: state => canInsert(state, nodeType),
        run(state, _, view) {
            // ...
        }
    })
}

/**
 * Build a heading item, h1 and h2 for the first and second blocks, rest are h3 and h4.
 * 
 * @param {number} level
 * @param {*} options
 */
export function makeHeading(level, options) {
    const isHeading = state => {
        const selectedNode = state.selection.$from.node(1);
        return selectedNode && selectedNode.type.name == "heading" && selectedNode.attrs.level == level;
    }
    return new MenuItem({
        ...options,
        class: "blue-editor-icon",
        active: isHeading,
        select: state => selectHeading(state, level),
        enable: state => enableHeading(state, level),
        run(state, dispatch) {
            if (isHeading(state)) {
                return setBlockType(state.schema.nodes.paragraph)(state, dispatch);
            }
            return setBlockType(state.schema.nodes.heading, { level })(state, dispatch);
        }
    });
}

function cmdItem(cmd, options) {
    let passedOptions = {
        label: options.title,
        run: cmd
    }
    for (let prop in options) passedOptions[prop] = options[prop]
    if ((!options.enable || options.enable === true) && !options.select)
        passedOptions[options.enable ? "enable" : "select"] = state => cmd(state)

    return new MenuItem(passedOptions)
}

/**
 * 
 * @param {MarkType} markType 
 * @param {*} options 
 */
export function markItem(markType, options) {
    let passedOptions = {
        active: state => markActive(state, markType),
        enable: true
    }
    for (let prop in options) passedOptions[prop] = options[prop]
    return cmdItem(toggleMark(markType), passedOptions)
}

/**
 * 
 * @param {MarkType} markType 
 */
export function linkItem(markType) {
    return new MenuItem({
        title: "Add or remove link",
        icon: icons.link,
        active: state => markActive(state, markType),
        enable: state => !state.selection.empty,
        run(state, dispatch, view) {
            // ...
        }
    })
}

export function wrapListItem(nodeType, options) {
    return cmdItem(wrapInList(nodeType, options.attrs), options)
}

/**
 * Wrap selection in blockquote.
 * @param {NodeType} nodeType 
 * @param {*} options 
 */
export function wrapBlockquote(nodeType, options) {
    /**
     * Check whether blockquote is active.
     * @param {EditorState} state 
     */
    const isActive = state => {
        const selectedNode = state.selection.$from.node(1);
        const wrappedIn = wrapIn(nodeType, options.attrs instanceof Function ? null : options.attrs)(state);
        if (selectedNode && selectedNode.type.name == "blockquote" && !wrappedIn) {
            return true;
        }
        return false;
    }

    let passedOptions = {
        run(state, dispatch) {
            return wrapIn(nodeType, options.attrs)(state, dispatch);
        },
        active: state => isActive(state),
    }
    for (let prop in options) passedOptions[prop] = options[prop]
    return new MenuItem(passedOptions)
}