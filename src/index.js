import { Schema, DOMParser, Node } from 'prosemirror-model';
import { Plugin, EditorState } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { EditorView } from 'prosemirror-view';
import { baseKeymap } from 'prosemirror-commands';
import { addListNodes } from "prosemirror-schema-list";
import { history } from 'prosemirror-history';
import { schema } from './schema';
import buildInputRules from './inputrules';
import buildKeyMap from './keymap';
import buildMenuItems from './menu';
import inlineMenuBar from './inline-menubar';
import blockMenuBar from './block-menubar';

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
        blockMenuBar({
            blockFormatMenu: menuItems.blockFormatMenu,
            blockInsertMenu: menuItems.blockInsertMenu
        }),
        history()
    ]

    return plugins.concat(new Plugin({
        props: {
            attributes: { class: 'blue-editor-style' }
        }
    }));
}

const state = EditorState.create({
    // doc: DOMParser.fromSchema(blueSchema).parse(document.querySelector("#content")),
    doc: Node.fromJSON(blueSchema, JSON.parse('{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Hello ProseMirror"}]},{"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"This is heading level 2"}]},{"type":"paragraph","content":[{"type":"text","text":"This is editable text. You can focus it and start typing."}]},{"type":"paragraph","content":[{"type":"text","text":"To apply styling, you can select a piece of text and manipulate its styling from the menu. The basic schema supports "},{"type":"text","marks":[{"type":"em"}],"text":"emphasis"},{"type":"text","text":", "},{"type":"text","marks":[{"type":"strong"}],"text":"strong text"},{"type":"text","text":", "},{"type":"text","marks":[{"type":"link","attrs":{"href":"http://marijnhaverbeke.nl/blog","title":null}}],"text":"links"},{"type":"text","text":", "},{"type":"text","marks":[{"type":"code"}],"text":"code font"},{"type":"text","text":", and "},{"type":"image","attrs":{"src":"/img/smiley.png","alt":null,"title":null}},{"type":"text","text":" images."}]},{"type":"paragraph","content":[{"type":"text","text":"Block-level structure can be manipulated with key bindings (try ctrl-shift-2 to create a level 2 heading, or enter in an empty textblock to exit the parent block), or through the menu."}]},{"type":"paragraph","content":[{"type":"text","text":"Try using the “list” item in the menu to wrap this paragraph in a numbered list."}]},{"type":"code_block","content":[{"type":"text","text":"It OK"}]},{"type":"paragraph"}]}')),
    plugins: BlueEditorPlugins({ schema: blueSchema, keyMaps: null }),
});

let view = new EditorView(document.querySelector("#editor"), { state })

// Apply ProseMirror dev-tools
ProseMirrorDevTools.applyDevTools(view, { EditorState: state });