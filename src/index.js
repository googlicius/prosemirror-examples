import { Plugin, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser } from "prosemirror-model";
import { schema } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';
import { toggleMark } from 'prosemirror-commands';

/**
 * @typedef {Object} Item
 * @property {HTMLElement} dom
 * @property {(state: EditorState, dispatch: Function, view: EditorView)} command
 */

class MenuView {
    dom = document.createElement("div");

    /**
     * @type Array<Item>
     */
    items;

    /**
     * @type EditorView
     */
    editorView;

    /**
     * Constructor
     * @param {Array<Item>} items 
     * @param {EditorView} editorView 
     */
    constructor(items, editorView) {
        this.dom.className = "menubar";
        this.items = items;
        this.editorView = editorView;

        this.items.forEach(({ dom }) => this.dom.appendChild(dom));
        this.update();

        this.dom.addEventListener("mousedown", e => {
            e.preventDefault();
            editorView.focus();
            items.forEach(({ command, dom }) => {
                if (dom.contains(e.target)) {
                    command(editorView.state, editorView.dispatch, editorView);
                }
            })
        })
    }

    update() {
        this.items.forEach(({command, dom}) => {
            let active = command(this.editorView.state, null, this.editorView);
            dom.style.display = active ? "" : "none"
        })
    }

    destroy() {
        this.dom.destroy();
    }
}

// Helper function to create menu icons
function icon(text, name) {
    let span = document.createElement("span")
    span.className = "menuicon " + name
    span.title = name
    span.textContent = text
    return span
}

/**
 * 
 * @param {Array} items 
 */
function menuPlugin(items) {
    return new Plugin({
        view(editorView) {
            let menuView = new MenuView(items, editorView);
            editorView.dom.parentNode.insertBefore(menuView.dom, editorView.dom);
            return menuView;
        }
    })
}

let menu = menuPlugin([
    { command: toggleMark(schema.marks.strong), dom: icon("B", "strong") }
])