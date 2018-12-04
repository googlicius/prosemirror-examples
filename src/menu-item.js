import { toggleMark, setBlockType, wrapIn } from "prosemirror-commands";
import { canInsert, markActive, selectHeading, enableHeading } from './menu-item-utils';
import { MenuItem, icons } from 'prosemirror-menu';
import { EditorState } from 'prosemirror-state';
import { wrapInList } from "prosemirror-schema-list";

/**
 * insert image item
 * @param {NodeType} nodeType 
 */
export function insertImageItem(nodeType) {
    return new MenuItem({
        title: "Image insert",
        label: "Image",
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
 */
export function makeHeading(level, icon) {
    const isHeading = state => {
        const node = state.selection.$from.node(1);
        return node.type.name == "heading" && node.attrs.level == level;
    }
    return new MenuItem({
        title: "Add heading",
        icon: icon,
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
        if (selectedNode.type.name == "blockquote" && !wrappedIn) {
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