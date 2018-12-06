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

const blockMenus = {
    insert: "insert-menu",
    format: "format-menu",
}

/**
 * A Plugin that build a menu on block-level
 * @param {*} options 
 */
export default function blockMenuBar(options) {
    return new Plugin({
        view: editorView => new MenuBar(editorView, options)
    })
}

class MenuBar {
    /**
     * @type {string}
     */
    currentMenu;

    /**
     * @type NodeJS.Timer
     */
    updateTimer;

    /**
     * viewport rectangle at a given document position of `lastState`
     * @type {{left: number, right: number, top: number, bottom: number}}
     */
    lastStart;

    /**
     * childCount of selectedNode of `lastState`
     * @type {number}
     */
    lastChildCount;

    /**
     * @param {EditorView} view 
     * @param {{blockFormatMenu: Array<MenuElement>, blockInsertMenu: Array<MenuElement>}} options 
     */
    constructor(view, options) {
        this.blockMenu = this._createBlockMenu(view);
        this.tooltip = this._createTooltip();
        this.options = options;
        view.dom.parentNode.appendChild(this.blockMenu);
        view.dom.parentNode.appendChild(this.tooltip);
        ["blur", "focus"].forEach(event => view.dom.addEventListener(event, () => this.update(view, null)));
        this.update(view, null);
    }

    /**
     * Update view
     * 
     * @param {EditorView} view 
     * @param {EditorState} lastState 
     */
    update = (view, lastState) => {
        // Hide the button when the editor lost focus
        if (!view.hasFocus()) {
            this.blockMenu.style.display = "none";
            this.tooltip.style.display = "none";
            return;
        }
        if (this.tooltip.style.display == "") {
            this.tooltip.style.display = "none";
        }
        
        const from = view.state.selection.from;
        const start = view.coordsAtPos(from);
        const selectedNode = view.state.selection.$from.node(1);
        const childCount = selectedNode && selectedNode.childCount;

        if (this.blockMenu.style.display == "none" || (this.lastStart && start.top != this.lastStart.top)) {
            this._positionBlockMenu(view);
        }
        
        if(this.lastChildCount != childCount) {
            this.updateBlockMenu(view.state);
        }

        this.lastStart = start;
        this.lastChildCount = childCount;
    }

    destroy = () => {
        this.blockMenu.destroy();
        this.tooltip.destroy();
    }

    /**
     * @param {EditorView} view
     */
    _createBlockMenu = (view) => {
        const domRect = view.dom.getBoundingClientRect();
        const blockMenu = document.createElement('div');
        const menuItems = this._buildMenuItems();
        blockMenu.className = "block-menu-button";
        blockMenu.style.right = `${domRect.right - domRect.left}px`;
        let { dom, update } = renderGrouped(view, [[menuItems.menuItem_Insert(), menuItems.menuItem_Format()]]);
        this.updateBlockMenu = update;
        blockMenu.appendChild(dom);
        return blockMenu;
    }

    _createTooltip = () => {
        const tooltip = document.createElement('div');
        tooltip.className = "blue-editor-menu blue-editor-block-menu arrow-down";
        return tooltip;
    }

    /**
     * Display and position the tooltip
     * 
     * @param {EditorView} view 
     */
    _positionTooltip = (view) => {
        let state = view.state;
        this.tooltip.style.display = "";
        this.tooltip.style.top = null;
        this.tooltip.style.bottom = null;
        this.tooltip.classList.remove("arrow-up");
        this.tooltip.classList.add("arrow-down");
        let { from } = state.selection;
        // These are in screen coordinates
        let start = view.coordsAtPos(from);
        const menuItem = this.blockMenu.querySelector(`.${this.currentMenu}`);
        const menuRect = menuItem.getBoundingClientRect();
        // The box in which the tooltip is positioned, to use as base
        let box = this.tooltip.offsetParent.getBoundingClientRect();
        // Find a center-ish x position from the selection endpoints (when
        // crossing lines, end may be more to the left)
        let left = Math.max((menuRect.left + menuRect.right) / 2);
        // Check `style_left < minLeft` to prevent the tooltip out of window.
        this.tooltip.style.left = left - box.left + 'px';
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
     * Build Menu items
     */
    _buildMenuItems = () => {
        /**
         * Render or hide the menu.
         * 
         * @param {EditorView} view 
         * @param {string} menu_name 
         * @param {Array<MenuElement>} content
         */
        const renderMenu = (view, menu_name, content) => {
            if (this.tooltip.style.display == "none" || this.currentMenu != menu_name) {
                this.currentMenu = menu_name;
                let { dom, update } = renderGrouped(view, content);
                this.tooltip.innerHTML = '';
                this.tooltip.appendChild(dom);
                update(view.state);
                this._positionTooltip(view);
            }
            else {
                this.tooltip.style.display = "none";
            }
        }

        /**
         * Build format menu item.
         */
        const menuItem_Format = () => {
            return new MenuItem({
                title: "Định dạng khối",
                icon: icons.buttonIcon,
                class: blockMenus.format,
                run: (state, _, view) => {
                    renderMenu(view, blockMenus.format, this.options.blockFormatMenu);
                },
            })
        }

        /**
         * Build insert menu item.
         */
        const menuItem_Insert = () => {
            return new MenuItem({
                title: "Chèn",
                icon: icons.plusOutline,
                class: blockMenus.insert,
                run: (state, _, view) => {
                    renderMenu(view, blockMenus.insert, this.options.blockInsertMenu);
                },
                select: state => {
                    const selectedNode = state.selection.$from.node(1);
                    const childCount = selectedNode && selectedNode.childCount;
                    return childCount === 0;
                }
            })
        }

        return { menuItem_Format, menuItem_Insert };
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