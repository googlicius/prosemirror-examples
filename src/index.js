import { Schema, DOMParser, Node } from 'prosemirror-model';
import { Plugin, EditorState } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { EditorView } from 'prosemirror-view';
import { baseKeymap } from 'prosemirror-commands';
import { addListNodes } from "prosemirror-schema-list";
import { history } from 'prosemirror-history';
import { schema } from './schema';
import buildKeyMap from './keymap';
import buildMenuItems from './menu';
import buildInputRules from './plugins/inputrules';
import inlineMenuBar from './plugins/inline-menubar';
import blockMenuBar from './plugins/block-menubar';
import synsNameAttribute from './plugins/sync-name-attribute';
// import { makeid } from './pure-func';

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const proseSchema = new Schema({
    nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
    marks: schema.spec.marks
});

/**
 * @override `createParagraphNear` in 'prosemirror-commands'
 * @param {EditorState} state 
 * @param {*} dispatch 
 */
// function createParagraphNear(state, dispatch) {
//     let { $from, $to } = state.selection
//     if ($from.parent.inlineContent || $to.parent.inlineContent) return false
//     let type = $from.parent.contentMatchAt($to.indexAfter()).defaultType
//     if (!type || !type.isTextblock) return false
//     if (dispatch) {
//         let side = (!$from.parentOffset && $to.index() < $to.parent.childCount ? $from : $to).pos
//         let tr = state.tr.insert(side, type.createAndFill({ name: makeid() }))
//         tr.setSelection(TextSelection.create(tr.doc, side + 1))
//         dispatch(tr.scrollIntoView())
//     }
//     return true
// }

/**
 * @typedef Options
 * @property {Schema} schema The schema to generate key bindings and menu items for.
 * @property {Object} keyMaps Can be used to [adjust](#example-setup.buildKeymap) the key bindings created.
 */

/**
 * A convenience plugin that bundles together
 * key bindings, input rules, and styling for the Prose-Editor.
 * 
 * @param {Options} options
 * @returns {Array<Plugin>}
 */
function ProseEditorPlugins(options) {
    const menuItems = buildMenuItems(options.schema);
    let plugins = [
        buildInputRules(options.schema),
        keymap(buildKeyMap(options.schema, options.keyMaps)),
        keymap(baseKeymap),
        inlineMenuBar({ content: menuItems.inlineMenu }),
        blockMenuBar({
            blockFormatMenu: menuItems.blockFormatMenu,
            blockInsertMenu: menuItems.blockInsertMenu
        }),
        synsNameAttribute(),
        history()
    ]

    return plugins.concat(new Plugin({
        props: {
            attributes: { class: 'prose-editor-style' }
        }
    }));
}

/**
 * @typedef ProseEditorSpec
 * @property {HTMLElement} editorElement
 * @property {*} content
 * @property {boolean} editable
 */

/**
 * The Prose Editor
 * @param {ProseEditorSpec} options 
 */
export default function ProseEditor(options) {
    const editable = () => typeof options.editable != 'undefined' ? options.editable : true;

    let doc;
    if (typeof options.content == "string") {
        doc = Node.fromJSON(proseSchema, JSON.parse(options.content));
    }
    else {
        doc = DOMParser.fromSchema(proseSchema).parse(options.content);
    }

    const state = EditorState.create({
        doc,
        plugins: editable() ? ProseEditorPlugins({ schema: proseSchema, keyMaps: null }) : [],
    });

    let view = new EditorView(options.editorElement, { state, editable });

    return { state, view };
}