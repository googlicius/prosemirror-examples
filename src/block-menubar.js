import { Plugin, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { renderGrouped, MenuItem } from 'prosemirror-menu';

const icons = {
    buttonIcon: {
        width: 32, height: 32,
        path: "M12 0h16v4h-4v28h-4v-28h-4v28h-4v-16c-4.418 0-8-3.582-8-8s3.582-8 8-8z"
    },
    plusOutline: {
        width: 20, height: 20,
        path: "M11 9h4v2h-4v4h-2v-4h-4v-2h4v-4h2v4zM10 20c-5.523 0-10-4.477-10-10s4.477-10 10-10v0c5.523 0 10 4.477 10 10s-4.477 10-10 10v0zM10 18c4.418 0 8-3.582 8-8s-3.582-8-8-8v0c-4.418 0-8 3.582-8 8s3.582 8 8 8v0z"
    }
}

export function blockMenuBar(options) {
    return new Plugin({
        view: editorView => new MenuBar(editorView, options)
    })
}

class MenuBar {
    /**
     * @param {EditorView} view 
     * @param {{blockFormatMenu: any}} options 
     */
    constructor(view, options) {
        this.blockMenu = this._createBlockMenu(view);
        this.tooltip = this._createTooltip();
        this.options = options;
        view.dom.parentNode.appendChild(this.blockMenu);
        view.dom.parentNode.appendChild(this.tooltip);
        view.dom.addEventListener("blur", () => {
            this.update(view, null);
        });
        this.update(view, null);
    }

    /**
     * Update view
     * @param {EditorView} view 
     * @param {EditorState} lastState 
     */
    update = (view, lastState) => {
        let from = view.state.selection.from;
        let lastFrom = lastState ? lastState.selection.from : null;
        
        // Hide the button when the editor lost focus
        if (!view.hasFocus()) {
            this.blockMenu.style.display = "none";
            this.tooltip.style.display = "none";
            return;
        }
        if (this.tooltip.style.display == "") {
            this.tooltip.style.display = "none";
        }
        let lastStart;
        const start = view.coordsAtPos(from);
        try {
            lastStart = view.coordsAtPos(lastFrom || 0);
        } catch (error) {
            // If lastFrom out of document, An error will be raised.
        }
        if(this.blockMenu.style.display == "none" || !lastStart || start.top != lastStart.top) {
            this._positionBlockMenu(view);
        }
    }

    destroy = () => {
        this.blockMenu.destroy();
        this.tooltip.destroy();
    }

    _createBlockMenu = (view) => {
        const blockMenu = document.createElement('div');
        blockMenu.className = "block-menu-button";
        blockMenu.style.left = "-65px";
        let { dom, update } = renderGrouped(view, [[this._insertMenuItem(), this._formatMenuItem()]]);
        blockMenu.appendChild(dom);
        return blockMenu;
    }

    _createTooltip = () => {
        const tooltip = document.createElement('div');
        tooltip.className = "blue-editor-menu blue-editor-block-menu arrow-down";
        return tooltip;
    }

    /**
     * Display and position block-menubar on `mouseover` the button
     * @param {EditorView} view 
     */
    _positionTooltip = (view) => {
        let state = view.state;
        this.tooltip.style.display = "";
        let { from } = state.selection;
        // These are in screen coordinates
        let start = view.coordsAtPos(from);
        const menuRect = this.blockMenu.getBoundingClientRect();
        // The box in which the tooltip is positioned, to use as base
        let box = this.tooltip.offsetParent.getBoundingClientRect();
        // Find a center-ish x position from the selection endpoints (when
        // crossing lines, end may be more to the left)
        let left = Math.max((menuRect.left + menuRect.right) / 2);
        // Check `style_left < minLeft` to prevent the tooltip out of window.
        this.tooltip.style.left = left - box.left + 'px';
        this.tooltip.style.bottom = (box.bottom - start.top) + 'px';
    }

    /**
     * Display and position the block-button.
     * @param {EditorView} view 
     */
    _positionBlockMenu = view => {
        this.blockMenu.style.display = "";
        const { from } = view.state.selection;
        // These are in screen coordinates
        let start = view.coordsAtPos(from);
        let box = this.blockMenu.offsetParent.getBoundingClientRect();
        this.blockMenu.style.bottom = box.bottom - start.bottom + "px";
    }

    /**
     * Build format menu item.
     */
    _formatMenuItem = () => {
        return new MenuItem({
            title: "Định dạng khối",
            icon: icons.buttonIcon,
            run: (state, _, view) => {
                if (this.tooltip.style.display == "none") {
                    let { dom, update } = renderGrouped(view, this.options.blockFormatMenu);
                    this.tooltip.innerHTML = '';
                    this.tooltip.appendChild(dom);
                    update(view.state);
                    this._positionTooltip(view);
                }
                else {
                    this.tooltip.style.display = "none";
                }
            }
        })
    }

    _insertMenuItem = () => {
        return new MenuItem({
            title: "Chèn",
            icon: icons.plusOutline,
            run: (state, _, view) => {

            }
        })
    }

    /**
     * Select parent node, Will not select the document node
     * @param {EditorState} state 
     */
    selectParentNode(state) {
        let { $from, to } = state.selection, pos
        let same = $from.sharedDepth(to)
        if (same == 0) return false
        pos = $from.before(same)
        return true
    }
}