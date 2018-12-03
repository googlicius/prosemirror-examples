import { NodeType, MarkType, Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import {
    MenuItem, icons, wrapItem, joinUpItem, liftItem, selectParentNodeItem,
    undoItem, redoItem, blockTypeItem
} from 'prosemirror-menu';
import { toggleMark, setBlockType } from "prosemirror-commands";
import { wrapInList } from "prosemirror-schema-list";
import { selectHeading1 } from './menu-item-helpers';

const customIcons = {
    biggerHeading: {
        width: 21, height: 21,
        path: "M3 2v4.747h1.656l.383-2.568.384-.311h3.88V15.82l-.408.38-1.56.12V18h7.174v-1.68l-1.56-.12-.407-.38V3.868h3.879l.36.311.407 2.568h1.656V2z"
    },
    smallerHeading: {
        width: 21, height: 21,
        path: "M4 5.5v4.74h1.657l.384-2.569.384-.312h2.733v8.461l-.41.38-1.91.12V18h7.179v-1.68l-1.912-.12-.405-.38V7.359h2.729l.36.312.408 2.57h1.657V5.5z"
    }
}

// Helpers to create specific types of items

/**
 * Can insert
 * @param {EditorState} state 
 * @param {NodeType} nodeType 
 */
function canInsert(state, nodeType) {
    let $from = state.selection.$from;
    for (let d = $from.depth; d >= 0; d--) {
        let index = $from.index(d);
        if ($from.node(d).canReplaceWith(index, index, nodeType)) return true;
    }
    return false;
}

/**
 * insert image item
 * @param {NodeType} nodeType 
 */
function insertImageItem(nodeType) {
    return new MenuItem({
        title: "Image insert",
        label: "Image",
        enable: state => canInsert(state, nodeType),
        run(state, _, view) {
            // ...
        }
    })
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
 * Check whether the selection is in given type.
 * 
 * @param {EditorState} state 
 * @param {MarkType} type 
 * @returns {boolean}
 */
function markActive(state, type) {
    let { from, $from, to, empty } = state.selection;
    if (empty) return type.isInSet(state.storedMarks || $from.marks());
    else return state.doc.rangeHasMark(from, to, type);
}

/**
 * 
 * @param {MarkType} markType 
 * @param {*} options 
 */
function markItem(markType, options) {
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
function linkItem(markType) {
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

function wrapListItem(nodeType, options) {
    return cmdItem(wrapInList(nodeType, options.attrs), options)
}

/**
 * Build a heading item, h1 and h2 for the first and second blocks, rest are h3 and h4.
 * 
 * @param {number} level
 */
function makeHeading(level, icon) {
    const isHeading = state => {
        const node = state.selection.$from.node(1);
        return node.type.name == "heading" && node.attrs.level == level;
    }
    return new MenuItem({
        title: "Add heading",
        icon: icon,
        class: "blue-editor-icon",
        active: isHeading,
        select: state => selectHeading1(state),
        run(state, dispatch) {
            if (isHeading(state)) {
                return setBlockType(state.schema.nodes.paragraph)(state, dispatch);
            }
            return setBlockType(state.schema.nodes.heading, { level })(state, dispatch);
        }
    });
}

/**
 * :: (Schema) → Object
 * Given a schema, look for default mark and node types in it and
 * return an object with relevant menu items relating to those marks:
 * 
 * **`toggleStrong`**`: MenuItem`
 * : A menu item to toggle the [strong mark](#schema-basic.StrongMark).
 * 
 * **`toggleEm`**`: MenuItem`
 * : A menu item to toggle the [emphasis mark](#schema-basic.EmMark).
 * 
 * **`toggleCode`**`: MenuItem`
 * : A menu item to toggle the [code font mark](#schema-basic.CodeMark).
 * 
 * **`toggleLink`**`: MenuItem`
 * : A menu item to toggle the [link mark](#schema-basic.LinkMark).
 * 
 * **`insertImage`**`: MenuItem`
 * : A menu item to insert an [image](#schema-basic.Image).
 * 
 * **`wrapBulletList`**`: MenuItem`
 * : A menu item to wrap the selection in a [bullet list](#schema-list.BulletList).
 * 
 * **`wrapOrderedList`**`: MenuItem`
 * : A menu item to wrap the selection in an [ordered list](#schema-list.OrderedList).
 * 
 * **`wrapBlockQuote`**`: MenuItem`
 * : A menu item to wrap the selection in a [block quote](#schema-basic.BlockQuote).
 * 
 * **`makeParagraph`**`: MenuItem`
 * : A menu item to set the current textblock to be a normal
 * [paragraph](#schema-basic.Paragraph).
 * 
 * **`makeCodeBlock`**`: MenuItem`
 * : A menu item to set the current textblock to be a
 * [code block](#schema-basic.CodeBlock).
 * 
 * **`makeHead[N]`**`: MenuItem`
 * : Where _N_ is 1 to 6. Menu items to set the current textblock to
 * be a [heading](#schema-basic.Heading) of level _N_.
 * 
 * **`insertHorizontalRule`**`: MenuItem`
 * : A menu item to insert a horizontal rule.
 * 
 * The return value also contains some prefabricated menu elements and
 * menus, that you can use instead of composing your own menu from
 * scratch:
 * 
 * **`insertMenu`**`: Dropdown`
 * : A dropdown containing the `insertImage` and
 * `insertHorizontalRule` items.
 * 
 * **`typeMenu`**`: Dropdown`
 * : A dropdown containing the items for making the current
 * textblock a paragraph, code block, or heading.
 * 
 * **`fullMenu`**`: [[MenuElement]]`
 * : An array of arrays of menu elements for use as the full menu
 * for, for example the [menu bar](https://github.com/prosemirror/prosemirror-menu#user-content-menubar).
 * @param {Schema} schema 
 */
export function buildMenuItems(schema) {
    let r = {}, type;
    if (type = schema.marks.strong)
        r.toggleStrong = markItem(type, { title: "Toggle strong style", icon: icons.strong });
    if (type = schema.marks.em)
        r.toggleEm = markItem(type, { title: "Toggle emphasis", icon: icons.em });
    if (type = schema.marks.code)
        r.toggleCode = markItem(type, { title: "Toggle code font", icon: icons.code });
    if (type = schema.marks.link)
        r.toggleLink = linkItem(type);

    if (type = schema.nodes.image)
        r.insertImage = insertImageItem(type)
    if (type = schema.nodes.bullet_list)
        r.wrapBulletList = wrapListItem(type, {
            title: "Wrap in bullet list",
            icon: icons.bulletList
        })
    if (type = schema.nodes.ordered_list)
        r.wrapOrderedList = wrapListItem(type, {
            title: "Wrap in ordered list",
            icon: icons.orderedList
        })
    if (type = schema.nodes.blockquote) {
        r.wrapBlockQuote = wrapItem(type, {
            title: "Wrap in block quote",
            icon: icons.blockquote
        })
    }

    if (type = schema.nodes.heading) {
        r.makeHead1 = makeHeading(1, customIcons.biggerHeading);
        r.makeHead2 = makeHeading(2, customIcons.biggerHeading);
        r.makeHead3 = makeHeading(3, customIcons.smallerHeading);
        r.makeHead4 = makeHeading(4, customIcons.biggerHeading);
    }

    /**
     * @param {Array} arr 
     */
    let cut = arr => arr.filter(x => x);
    r.inlineMenu = [cut([r.toggleStrong, r.toggleEm, r.toggleCode, r.toggleLink])];
    r.blockMenu = [cut([r.makeHead1, r.makeHead3, r.makeParagraph, r.wrapBulletList, r.wrapOrderedList, r.wrapBlockQuote])];
    r.fullMenu = r.inlineMenu.concat([[undoItem, redoItem]], r.blockMenu)

    return r;
}