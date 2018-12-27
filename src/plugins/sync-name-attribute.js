import { Plugin } from 'prosemirror-state';

export default function syncNameAttribute() {
    return new Plugin({
        view: editorView => {
            console.log("editorView.state.doc", editorView.state.doc);
            return {
                update(view, prevState) {
                    let state = view.state;
                    // Don't do anything if the document/selection didn't change
                    if (prevState && prevState.doc.eq(state.doc) && prevState.selection.eq(state.selection)) {
                        return;
                    }
                },

                destroy() {

                }
            }
        }
    })
}