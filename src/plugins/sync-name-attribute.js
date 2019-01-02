import { Plugin } from 'prosemirror-state';
import { setBlockType } from "prosemirror-commands";
import { makeid } from "./../pure-func";

export default function syncNameAttribute() {
    return new Plugin({
        view(editorView) {
            const state = editorView.state;

            /**
             * Set name attribute to `paragraph`, `heading`.
             */
            function setName() {
                let tr = state.tr;
                state.doc.forEach((node, offset) => {
                    switch (node.type.name) {
                        case 'paragraph':
                            if (node.attrs.name == null) {
                                tr = tr.setBlockType(
                                    offset + 1,
                                    offset + node.nodeSize,
                                    state.schema.nodes.paragraph,
                                    { name: makeid() }
                                );
                            }
                            break;
                            
                        case 'heading':
                            if (node.attrs.name == null) {
                                tr = tr.setBlockType(
                                    offset + 1, 
                                    offset + node.nodeSize, 
                                    state.schema.nodes.heading, 
                                    { level: node.attrs.level, name: makeid() }
                                );
                            }
                            break;

                        case 'ordered_list':
                        case 'bullet_list':
                            node.forEach((item_node, offset2) => {
                                item_node.forEach((paragraph_node, offset3) => {
                                    if (paragraph_node.attrs.name == null) {
                                        const total_offset = offset + offset2 + offset3 + 2;
                                        tr = tr.setBlockType(
                                            total_offset + 1, 
                                            total_offset + paragraph_node.nodeSize, 
                                            state.schema.nodes.paragraph, 
                                            { name: makeid() }
                                        );
                                    }
                                });
                            })
                            break;

                        case 'blockquote':
                            node.forEach((paragraph_node, offset2) => {
                                if (paragraph_node.attrs.name == null) {
                                    const total_offset = offset + offset2 + 1;
                                    tr = tr.setBlockType(
                                        total_offset + 1, 
                                        total_offset + paragraph_node.nodeSize, 
                                        state.schema.nodes.paragraph, 
                                        { name: makeid() }
                                    );
                                }
                            });
                            break;
                    }
                });
                editorView.dispatch(tr);
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
                    // Set name attribute to selected node, if the name is empty.
                    // NOTE: The seleted node is always a `heading` or `paragraph` whatever the cursor is 
                    // pointing to `blockquote`, `list item` or empty block,... But heading is always has a 
                    // name attribute. So we don't need to set name for heading here.
                    if(selectedNode.attrs.name == null && selectedNode.type.name == 'paragraph') {
                        setBlockType(state.schema.nodes.paragraph, { name: makeid() })(state, view.dispatch);
                    }
                },

                destroy() {
                    // 
                }
            }
        }
    })
}