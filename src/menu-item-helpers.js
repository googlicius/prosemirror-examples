import { EditorState } from 'prosemirror-state';

/**
 * 
 * @param {EditorState} state 
 */
export const selectHeading1 = state => {
    // let { $from, from, to } = state.selection, pos;
    // const node  = state.selection.$from.node(1);
    // if(node.type.name != "heading") {
    //     return true;
    // }
    return true;
}