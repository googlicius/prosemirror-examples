// @ts-check
import { Schema } from 'prosemirror-model';
import { wrapIn, setBlockType, toggleMark, chainCommands, exitCode } from 'prosemirror-commands';
import { wrapInList, splitListItem, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { undo, redo } from 'prosemirror-history';
import { undoInputRule } from 'prosemirror-inputrules';

const mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false

/**
 * Build key map
 * 
 * @param {Schema} schema
 * @param {*} mapKeys 
 */
export const buildKeyMap = (schema, mapKeys) => {
    let keys = {};
    let type;

    /**
     * You can suppress or map these bindings by passing a `mapKeys`
     * argument, which maps key names (say `"Mod-B"` to either `false`, to
     * remove the binding, or a new key name string.
     * 
     * @param {string} key 
     * @param {*} cmd 
     */
    const bind = (key, cmd) => {
        if (mapKeys) {
            let mapped = mapKeys[key];
            if (mapped === false) return;
            if (mapped) key = mapped;
        }
        keys[key] = cmd;
    }

    bind("Mod-z", undo);
    bind("Shift-Mod-z", redo);
    bind("Backspace", undoInputRule);
    if (!mac) bind("Mod-y", redo);

    if (type = schema.marks.strong)
        bind("Mod-b", toggleMark(type));
    if (type = schema.marks.em)
        bind("Mod-i", toggleMark(type));
    if (type = schema.marks.code)
        bind("Mod-`", toggleMark(type));

    if (type = schema.nodes.bullet_list)
        bind("Shift-Ctrl-8", wrapInList(type));
    if (type = schema.nodes.ordered_list)
        bind("Shift-Ctrl-9", wrapInList(type));
    if (type = schema.nodes.blockquote)
        bind("Ctrl->", wrapIn(type));
    if (type = schema.nodes.hard_break) {
        let br = type, cmd = chainCommands(exitCode, (state, dispatch) => {
            dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
            return true;
        });
        bind("Mod-Enter", cmd);
        bind("Shift-Enter", cmd);
        if (mac) bind("Ctrl-Enter", cmd);
    }
    if(type = schema.nodes.list_item) {
        bind("Enter", splitListItem(type));
        bind("Mod-[", liftListItem(type));
        bind("Mod-]", sinkListItem(type));
    }
    if (type = schema.nodes.code_block)
        bind("Shift-Ctrl-\\", setBlockType(type));

    return keys;
}