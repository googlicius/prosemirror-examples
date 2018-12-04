import { Schema } from 'prosemirror-model';
import { icons, undoItem, redoItem } from 'prosemirror-menu';
import { makeHeading, insertImageItem, markItem, linkItem, wrapListItem, wrapBlockquote } from './menu-item';

const customIcons = {
    biggerHeading: {
        width: 21, height: 21,
        path: "M3 2v4.747h1.656l.383-2.568.384-.311h3.88V15.82l-.408.38-1.56.12V18h7.174v-1.68l-1.56-.12-.407-.38V3.868h3.879l.36.311.407 2.568h1.656V2z"
    },
    smallerHeading: {
        width: 21, height: 21,
        path: "M4 5.5v4.74h1.657l.384-2.569.384-.312h2.733v8.461l-.41.38-1.91.12V18h7.179v-1.68l-1.912-.12-.405-.38V7.359h2.729l.36.312.408 2.57h1.657V5.5z"
    }
}

// Helpers to create specific types of items


/**
 * :: (Schema) → Object
 * Given a schema, look for default mark and node types in it and
 * return an object with relevant menu items relating to those marks:
 * 
 * **`toggleStrong`**`: MenuItem`
 * : A menu item to toggle the [strong mark](#schema-basic.StrongMark).
 * 
 * **`toggleEm`**`: MenuItem`
 * : A menu item to toggle the [emphasis mark](#schema-basic.EmMark).
 * 
 * **`toggleCode`**`: MenuItem`
 * : A menu item to toggle the [code font mark](#schema-basic.CodeMark).
 * 
 * **`toggleLink`**`: MenuItem`
 * : A menu item to toggle the [link mark](#schema-basic.LinkMark).
 * 
 * **`insertImage`**`: MenuItem`
 * : A menu item to insert an [image](#schema-basic.Image).
 * 
 * **`wrapBulletList`**`: MenuItem`
 * : A menu item to wrap the selection in a [bullet list](#schema-list.BulletList).
 * 
 * **`wrapOrderedList`**`: MenuItem`
 * : A menu item to wrap the selection in an [ordered list](#schema-list.OrderedList).
 * 
 * **`wrapBlockQuote`**`: MenuItem`
 * : A menu item to wrap the selection in a [block quote](#schema-basic.BlockQuote).
 * 
 * **`makeParagraph`**`: MenuItem`
 * : A menu item to set the current textblock to be a normal
 * [paragraph](#schema-basic.Paragraph).
 * 
 * **`makeCodeBlock`**`: MenuItem`
 * : A menu item to set the current textblock to be a
 * [code block](#schema-basic.CodeBlock).
 * 
 * **`makeHead[N]`**`: MenuItem`
 * : Where _N_ is 1 to 6. Menu items to set the current textblock to
 * be a [heading](#schema-basic.Heading) of level _N_.
 * 
 * **`insertHorizontalRule`**`: MenuItem`
 * : A menu item to insert a horizontal rule.
 * 
 * The return value also contains some prefabricated menu elements and
 * menus, that you can use instead of composing your own menu from
 * scratch:
 * 
 * **`insertMenu`**`: Dropdown`
 * : A dropdown containing the `insertImage` and
 * `insertHorizontalRule` items.
 * 
 * **`typeMenu`**`: Dropdown`
 * : A dropdown containing the items for making the current
 * textblock a paragraph, code block, or heading.
 * 
 * **`fullMenu`**`: [[MenuElement]]`
 * : An array of arrays of menu elements for use as the full menu
 * for, for example the [menu bar](https://github.com/prosemirror/prosemirror-menu#user-content-menubar).
 * @param {Schema} schema 
 */
export function buildMenuItems(schema) {
    let r = {}, type;
    if (type = schema.marks.strong)
        r.toggleStrong = markItem(type, { title: "Toggle strong style", icon: icons.strong });
    if (type = schema.marks.em)
        r.toggleEm = markItem(type, { title: "Toggle emphasis", icon: icons.em });
    if (type = schema.marks.code)
        r.toggleCode = markItem(type, { title: "Toggle code font", icon: icons.code });
    if (type = schema.marks.link)
        r.toggleLink = linkItem(type);

    if (type = schema.nodes.image)
        r.insertImage = insertImageItem(type)
    if (type = schema.nodes.bullet_list)
        r.wrapBulletList = wrapListItem(type, {
            title: "Wrap in bullet list",
            icon: icons.bulletList
        })
    if (type = schema.nodes.ordered_list)
        r.wrapOrderedList = wrapListItem(type, {
            title: "Wrap in ordered list",
            icon: icons.orderedList
        })
    if (type = schema.nodes.blockquote) {
        r.wrapBlockQuote = wrapBlockquote(type, {
            title: "Wrap in block quote",
            icon: icons.blockquote
        })
    }

    if (type = schema.nodes.heading) {
        r.makeHead1 = makeHeading(1, customIcons.biggerHeading);
        r.makeHead2 = makeHeading(2, customIcons.smallerHeading);
        r.makeHead3 = makeHeading(3, customIcons.biggerHeading);
        r.makeHead4 = makeHeading(4, customIcons.smallerHeading);
    }

    /**
     * @param {Array} arr 
     */
    let cut = arr => arr.filter(x => x);
    r.inlineMenu = [cut([r.toggleStrong, r.toggleEm, r.toggleCode, r.toggleLink])];
    r.blockFormatMenu = [cut([r.makeHead1, r.makeHead3, r.makeHead2, r.makeHead4, r.makeParagraph, r.wrapBulletList, r.wrapOrderedList, r.wrapBlockQuote])];
    r.fullMenu = r.inlineMenu.concat([[undoItem, redoItem]], r.blockFormatMenu)

    return r;
}