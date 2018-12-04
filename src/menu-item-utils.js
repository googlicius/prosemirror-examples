import { EditorState } from 'prosemirror-state';
import { NodeType } from 'prosemirror-model';
import { setBlockType } from "prosemirror-commands";

/**
 * Can insert
 * @param {EditorState} state 
 * @param {NodeType} nodeType 
 */
export function canInsert(state, nodeType) {
    let $from = state.selection.$from;
    for (let d = $from.depth; d >= 0; d--) {
        let index = $from.index(d);
        if ($from.node(d).canReplaceWith(index, index, nodeType)) return true;
    }
    return false;
}

/**
 * Check whether the selection is in given mark type.
 * 
 * @param {EditorState} state 
 * @param {MarkType} type 
 * @returns {boolean}
 */
export function markActive(state, type) {
    let { from, $from, to, empty } = state.selection;
    if (empty) return type.isInSet(state.storedMarks || $from.marks());
    else return state.doc.rangeHasMark(from, to, type);
}

/**
 * Display or hide heading items.
 * @param {EditorState} state 
 * @param {number} level
 */
export function selectHeading (state, level) {
    const selectedNode  = state.selection.$from.node(1);
    // Get first node and second node of document
    let firstNode, secondNode;
    try {
        firstNode = state.doc.child(0);
    } catch (error) {
        // console.log("Cannot get first node");
    }

    try {
        secondNode = state.doc.child(1);
    } catch (error) {
        // console.log("Cannot get second node")
    }

    // At first node, hide h3, h4
    if(selectedNode.eq(firstNode)) {
        if([3, 4].includes(level)) {
            return false;
        }
    }
    // At second node, hide h1, h4
    else if(selectedNode.eq(secondNode)) {
        if([1, 4].includes(level)) {
            return false;
        }
    }
    // Rest, hide h1, h2
    else {
        if([1, 2].includes(level)) {
            return false;
        }
    }
    return true;
}

/**
 * Enable/disable heading items.
 * @param {EditorState} state 
 * @param {number} level 
 */
export function enableHeading(state, level) {
    const selectedNode  = state.selection.$from.node(1);
    if(selectedNode.type.name != "heading") {
        return setBlockType(state.schema.nodes.heading, { level })(state);
    }
    return true;
}