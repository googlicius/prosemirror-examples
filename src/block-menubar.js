import { Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { renderGrouped, MenuItem } from 'prosemirror-menu';

const buttonIcon = {
    width: 32, height: 32,
    path: "M12 0h16v4h-4v28h-4v-28h-4v28h-4v-16c-4.418 0-8-3.582-8-8s3.582-8 8-8z"
}

export function blockMenuBar(options) {
    return new Plugin({
        view: editorView => new MenuBar(editorView, options)
    })
}

class MenuBar {
    /**
     * @param {EditorView} view 
     * @param {*} options 
     */
    constructor(view, options) {
        this.menuButton = this._createMenuButton(view);
        this.tooltip = this._createTooltip();
        view.dom.parentNode.appendChild(this.menuButton);
        view.dom.parentNode.appendChild(this.tooltip);
        view.dom.addEventListener("blur", () => {
            this.update(view, null);
        });
        this.menuButton.addEventListener("mouseover", () => {
            this.contentUpdate(view.state);
            this._displayTooltip(view);
        });
        let { dom, update } = renderGrouped(view, options.content);
        this.contentUpdate = update;
        this.tooltip.appendChild(dom);
        this.update(view, null);
    }

    /**
     * Update view
     * @param {EditorView} view 
     * @param {EditorState} lastState 
     */
    update = (view, lastState) => {
        // Hide the button when the editor lost focus
        if(!view.hasFocus()) {
            this.menuButton.style.display = "none";
            this.tooltip.style.display = "none";
            return;
        }
        if(this.tooltip.style.display == "") {
            this.tooltip.style.display = "none";
        }
        this.menuButton.style.display = "";
        const { from } = view.state.selection;
        // These are in screen coordinates
        let start = view.coordsAtPos(from);
        let box = this.menuButton.offsetParent.getBoundingClientRect();
        this.menuButton.style.bottom = (box.bottom - start.bottom) - 3 + "px";
    }

    destroy = () => {
        this.menuButton.destroy();
        this.tooltip.destroy();
    }

    _createMenuButton = (view) => {
        const menuButton = document.createElement('div');
        menuButton.className = "block-menu-button";
        menuButton.style.left = "-30";
        // menuButton.textContent = "+";
        let { dom, update } = renderGrouped(view, [[this.menuButton()]]);
        console.log(dom)
        menuButton.appendChild(dom);
        return menuButton;
    }

    _createTooltip = () => {
        const tooltip = document.createElement('div');
        tooltip.className = "blue-editor-menu blue-editor-block-menu";
        return tooltip;
    }

    /**
     * Show block-menubar on `mouseover` the button
     * @param {EditorView} view 
     */
    _displayTooltip = (view) => {
        let state = view.state;
        this.tooltip.style.display = "";
        let { from } = state.selection;
        // These are in screen coordinates
        let start = view.coordsAtPos(from);
        const menuRect = this.menuButton.getBoundingClientRect();
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
     * Build button.
     */
    menuButton = () => {
        return new MenuItem({
            title: "",
            icon: buttonIcon,
            run(state, dispatch, view) {
                // ...
            }
        })
    }
}