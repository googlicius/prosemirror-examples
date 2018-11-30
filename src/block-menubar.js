import { Plugin } from 'prosemirror-state';

export function blockMenuBar(options) {
    return new Plugin({
        view: editorView => new MenuBar(editorView, options)
    })
}

class MenuBar {
    constructor(view, options) {
        
    }

    update = (view, lastState) {
        // 
    }

    destroy = () => {
        // 
    }
}