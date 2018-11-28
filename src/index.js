// @ts-check
import { Schema } from 'prosemirror-model';
import { Plugin } from 'prosemirror-state';
import { buildInputRules } from './inputrules';
import { buildKeyMap } from './keymap';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';

/**
 * @typedef Options
 * @property {Schema} schema The schema to generate key bindings and menu items for.
 * @property {Object} keyMaps Can be used to [adjust](#example-setup.buildKeymap) the key bindings created.
 */

/**
 * A convenience plugin that bundles together
 * key bindings, input rules, and styling for the Blue-Editor.
 * 
 * @param {Options} options
 * @returns {Array<Plugin>}
 */
export function BlueEditorSetup(options) {
    let plugins = [
        buildInputRules(options.schema),
        keymap(buildKeyMap(options.schema, options.keyMaps)),
        keymap(baseKeymap)
    ]

    return plugins.concat(new Plugin({
        props: {
            attributes: { class: 'blue-editor-style' }
        }
    }));
}