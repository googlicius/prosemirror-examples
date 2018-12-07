import { Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { EditorState, Transaction } from 'prosemirror-state';
import { DOMParser } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';

const placeholderPlugin = new Plugin({
    state: {
        init: () => DecorationSet.empty,
        /**
         * Apply
         * @param {Transaction} tr 
         * @param {DecorationSet} set 
         */
        apply(tr, set) {
            // Adjust decoration positions to changes made by the transaction
            set = set.map(tr.mapping, tr.doc);
            // See if the transaction adds or removes any placeholders
            let action = tr.getMeta(this);
            if (action && action.add) {
                let widget = document.createElement("placeholder");
                let deco = Decoration.widget(action.add.pos, widget, { id: action.add.id });
                set = set.add(tr.doc, [deco]);
            }
            else if (action && action.remove) {
                set = set.remove(set.find(null, null, spec => spec.id == action.remove.id));
            }
            return set;
        }
    },
    props: {
        decorations(state) {
            return this.getState(state);
        }
    }
});

/**
 * Find placeholder
 * @param {EditorState} state 
 * @param {*} id 
 */
function findPlaceholder(state, id) {
    let decos = placeholderPlugin.getState(state)
    let found = decos.find(null, null, spec => spec.id == id);
    return found.length && found[0].from;
}

// This is just a dummy that loads the file and creates a data URL.
// You could swap it out with a function that does an actual upload
// and returns a regular URL for the uploaded file.
function uploadFile(file) {
    let reader = new FileReader
    return new Promise((accept, fail) => {
        reader.onload = () => accept(reader.result)
        reader.onerror = () => fail(reader.error)
        // Some extra delay to make the asynchronicity visible
        setTimeout(() => reader.readAsDataURL(file), 1500)
    })
}

/**
 * Start upload file
 * @param {EditorView} view 
 * @param {*} file 
 */
function startUploadFile(view, file) {
    // A fresh object to act as the ID for this upload
    let id = {}

    // Replace seletion with a placeholder
    let tr = view.state.tr;
    if (!tr.selection.empty) tr.deleteSelection();
    tr.setMeta(
        placeholderPlugin,
        {
            add: { id, pos: tr.selection.from }
        }
    );
    view.dispatch(tr);

    uploadFile(file).then(url => {
        let pos = findPlaceholder(view.state, id);
        let tr = view.state.tr;
        // If the content around the placeholder has been deleted, drop
        // the image
        if (pos == null) return;
        // Otherwise, insert it at the placeholder's position, and remove
        // the placeholder
        tr.replaceWith(pos, pos, schema.nodes.image.create({ src: url }));
        tr.setMeta(placeholderPlugin, { remove: { id } });
        view.dispatch(tr);
    }, () => {
        // On failure, just clean up the placeholder
        view.dispatch(view.state.tr.setMeta(placeholderPlugin, { remove: { id } }))
    });
}

let view = new EditorView(document.getElementById("editor"), {
    state: EditorState.create({
        doc: DOMParser.fromSchema(schema).parse(document.getElementById("content")),
        plugins: exampleSetup({ schema }).concat(placeholderPlugin)
    })
});

document.getElementById("image-upload").addEventListener("change", e => {
    if(view.state.selection.$from.parent.inlineContent && e.target.files.length) {
        startUploadFile(view, e.target.files[0]);
    }
    view.focus();
})