// @ts-check
import {
    inputRules, wrappingInputRule, textblockTypeInputRule,
    smartQuotes, emDash, ellipsis, InputRule
} from "prosemirror-inputrules";
import { NodeType, Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';

/**
 * Given a blockquote node type, returns an input rule that turns `"> "`
 * at the start of a textblock into a blockquote.
 * @param {NodeType} nodeType
 * @returns {InputRule}
 */
function blockQuoteRule(nodeType) {
    return wrappingInputRule(/^\s*>\s$/, nodeType);
}

/**
 * Given a list node type, returns an input rule that turns a number
 * followed by a dot at the start of a textblock into an ordered list.
 * @param {NodeType} nodeType 
 * @returns {InputRule}
 */
function orderedListRule(nodeType) {
    return wrappingInputRule(/^(\d+)\.\s$/, nodeType, match => ({ order: +match[1] }),
        (match, node) => node.childCount + node.attrs.order == +match[1]);
}

/**
 * Given a list node type, returns an input rule that turns a bullet
 * (dash, plush, or asterisk) at the start of a textblock into a
 * bullet list.
 * @param {NodeType} nodeType
 * @returns {InputRule}
 */
function bulletListRule(nodeType) {
    return wrappingInputRule(/^\s*([-+*])\s$/, nodeType);
}

// : (NodeType) → InputRule
// Given a code block node type, returns an input rule that turns a
// textblock starting with three backticks into a code block.
export function codeBlockRule(nodeType) {
    return textblockTypeInputRule(/^```$/, nodeType)
}

/**
 * A set of input rules for creating the basic block quotes, lists,
 * code blocks, and heading.
 * @param {Schema} schema
 * @returns {Plugin}
 */
export default function buildInputRules(schema) {
    let rules = smartQuotes.concat(ellipsis, emDash), type;
    if (type = schema.nodes.blockquote) rules.push(blockQuoteRule(type));
    if (type = schema.nodes.ordered_list) rules.push(orderedListRule(type));
    if (type = schema.nodes.bullet_list) rules.push(bulletListRule(type));
    if(type = schema.nodes.code_block) rules.push(codeBlockRule(type));
    return inputRules({ rules });
}