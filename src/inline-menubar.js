import { Plugin, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { renderGrouped } from 'prosemirror-menu';

export function isIOS123() {
    if (typeof navigator == "undefined") return false
    let agent = navigator.userAgent
    return !/Edge\/\d/.test(agent) && /AppleWebKit/.test(agent) && /Mobile\/\w+/.test(agent)
}

/**
 * :: (Object) → Plugin
 * A plugin that will place a menu bar in a tooltip.
 * 
 * options::-
 * Supports the following options:
 * 
 * content:: [[MenuElement]]
 * Provides the content of the menu, as a nested array to be
 * passed to `renderGrouped`.
 * @param {*} options 
 */
export default function inlineMenuBar(options) {
    return new Plugin({
        view: editorView => new MenuBarView(editorView, options)
    })
}

class MenuBarView {
    mousedown = false;

    /**
     * @param {EditorView} view 
     * @param {*} options 
     */
    constructor(view, options) {
        /**
         * @type EditorState
         */
        let prev;

        this.tooltip = document.createElement('div');
        this.tooltip.className = "blue-editor-menu blue-editor-inline-menu arrow-down";

        let { dom, update } = renderGrouped(view, options.content);
        this.contentUpdate = update;
        this.tooltip.appendChild(dom);

        view.dom.parentNode.appendChild(this.tooltip);
        view.dom.addEventListener('mousedown', () => {
            this.mousedown = true;
            prev = view.state;
        });
        // Listen event from document, not from view.dow
        document.addEventListener('mouseup', () => {
            this.mousedown = false;
            if(!view.state.selection.empty) {
                this.update(view, prev);
                prev = null;
            }
        });
        this.update(view, null);
    }

    /**
     * Update view
     * @param {EditorView} view 
     * @param {EditorState} lastState 
     */
    update = (view, lastState) => {
        let state = view.state;

        // Hide the tooltip if the selection is empty
        if (state.selection.empty) {
            this.tooltip.style.display = "none";
            return;
        }

        // Don't do anything if the document/selection didn't change
        if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
            return;
        }

        // Don't do anything if mouse is down
        if(this.mousedown) return;

        // Otherwise, reposition it and update its content
        this.contentUpdate(state);
        this._positionTooltip(view);
    }

    destroy = () => {
        this.tooltip.remove();
    }

    /**
     * Display and position tooltip
     * @param {EditorView} view
     */
    _positionTooltip = (view) => {
        const state = view.state;
        this.tooltip.style.display = "";
        this.tooltip.style.top = null;
        this.tooltip.style.bottom = null;
        this.tooltip.classList.remove("arrow-up");
        this.tooltip.classList.add("arrow-down");
        let { from, to } = state.selection;
        // These are in screen coordinates
        let start = view.coordsAtPos(from);
        let end = view.coordsAtPos(to);
        // The box in which the tooltip is positioned, to use as base
        let box = this.tooltip.offsetParent.getBoundingClientRect();
        // Minimum left of tooltip
        const minLeft = this.tooltip.offsetWidth / 2;
        // Find a center-ish x position from the selection endpoints (when
        // crossing lines, end may be more to the left)
        let left = Math.max((start.left + end.left) / 2, start.left + 3);
        const style_left = left - box.left;
        // Check `style_left < minLeft` to prevent the tooltip out of window.
        this.tooltip.style.left = style_left + 'px';
        this.tooltip.style.bottom = (box.bottom - start.top) + 'px';

        // Check whether tooltip is overlap screen.
        const tooltipBox = this.tooltip.getBoundingClientRect();
        if(tooltipBox.top < 0) {
            // Display the tooltip from bottom of selection
            this.tooltip.classList.remove("arrow-down");
            this.tooltip.classList.add("arrow-up");
            this.tooltip.style.bottom = null;
            this.tooltip.style.top =  start.bottom - box.top + 'px';
        }
    }
}