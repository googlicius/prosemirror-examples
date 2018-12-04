import { Schema, DOMParser } from 'prosemirror-model';
import { Plugin, EditorState } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { EditorView } from 'prosemirror-view';
import { baseKeymap } from 'prosemirror-commands';
import { schema } from './schema';
import { addListNodes } from "prosemirror-schema-list";
import { history } from 'prosemirror-history';
import { buildInputRules } from './inputrules';
import { buildKeyMap } from './keymap';
import { buildMenuItems } from './menu';
import { inlineMenuBar } from './inline-menubar';
import { blockMenuBar } from './block-menubar';

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const blueSchema = new Schema({
    nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
    marks: schema.spec.marks
})

/**
 * @typedef Options
 * @property {Schema} schema The schema to generate key bindings and menu items for.
 * @property {Object} keyMaps Can be used to [adjust](#example-setup.buildKeymap) the key bindings created.
 */

/**
 * A convenience plugin that bundles together
 * key bindings, input rules, and styling for the Blue-Editor.
 * 
 * @param {Options} options
 * @returns {Array<Plugin>}
 */
export function BlueEditorPlugins(options) {
    const menuItems = buildMenuItems(options.schema);
    let plugins = [
        buildInputRules(options.schema),
        keymap(buildKeyMap(options.schema, options.keyMaps)),
        keymap(baseKeymap),
        inlineMenuBar({ content: menuItems.inlineMenu }),
        blockMenuBar({ content: menuItems.blockMenu }),
        history()
    ]

    return plugins.concat(new Plugin({
        props: {
            attributes: { class: 'blue-editor-style' }
        }
    }));
}

const state = EditorState.create({
    doc: DOMParser.fromSchema(blueSchema).parse(document.querySelector("#content")),
    plugins: BlueEditorPlugins({ schema: blueSchema, keyMaps: null })
});

let view = new EditorView(document.querySelector("#editor"), { state })

ProseMirrorDevTools.applyDevTools(view, { EditorState: state });