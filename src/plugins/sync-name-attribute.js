import { Plugin } from 'prosemirror-state';
import { makeid } from "./../pure-func";

export default function syncNameAttribute() {
    return new Plugin({
        view: editorView => {
            /**
             * Set name attribute to `paragraph`, `heading`.
             */
            function setName() {
                const state = editorView.state;
                state.doc.forEach(node => {
                    switch (node.type.name) {
                        case 'paragraph':
                        case 'heading':
                            if (node.attrs.name == null) {
                                node.attrs.name = makeid();
                            }
                            break;

                        case 'ordered_list':
                        case 'bullet_list':
                            node.forEach(item_node => {
                                item_node.forEach(paragraph_node => {
                                    if (paragraph_node.attrs.name == null) {
                                        paragraph_node.attrs.name = makeid();
                                    }
                                });
                            })
                            break;

                        case 'blockquote':
                            node.forEach(paragraph_node => {
                                if (paragraph_node.attrs.name == null) {
                                    paragraph_node.attrs.name = makeid();
                                }
                            });
                            break;

                        default:
                            break;
                    }
                });
            }

            (function init() {
                setName();
            })();

            return {
                update(view, prevState) {
                    let state = view.state;
                    // Don't do anything if the document/selection didn't change
                    if (prevState && prevState.doc.eq(state.doc) && prevState.selection.eq(state.selection)) {
                        return;
                    }

                    const selectedNode = state.selection.$from.parent;
                    if(['paragraph', 'heading'].includes(selectedNode.type.name) && selectedNode.attrs.name == null) {
                        selectedNode.attrs.name = makeid();
                    }
                },

                destroy() {
                    // 
                }
            }
        }
    })
}