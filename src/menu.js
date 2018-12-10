import { Schema } from 'prosemirror-model';
import { icons, undoItem, redoItem } from 'prosemirror-menu';
import * as fromMenuItem from './menu-item';

const customIcons = {
    biggerHeading: {
        width: 21, height: 21,
        path: "M3 2v4.747h1.656l.383-2.568.384-.311h3.88V15.82l-.408.38-1.56.12V18h7.174v-1.68l-1.56-.12-.407-.38V3.868h3.879l.36.311.407 2.568h1.656V2z"
    },
    smallerHeading: {
        width: 21, height: 21,
        path: "M4 5.5v4.74h1.657l.384-2.569.384-.312h2.733v8.461l-.41.38-1.91.12V18h7.179v-1.68l-1.912-.12-.405-.38V7.359h2.729l.36.312.408 2.57h1.657V5.5z"
    },
    video: {
        width: 30, height: 28,
        path: "M6 25v-2c0-0.547-0.453-1-1-1h-2c-0.547 0-1 0.453-1 1v2c0 0.547 0.453 1 1 1h2c0.547 0 1-0.453 1-1zM6 19v-2c0-0.547-0.453-1-1-1h-2c-0.547 0-1 0.453-1 1v2c0 0.547 0.453 1 1 1h2c0.547 0 1-0.453 1-1zM6 13v-2c0-0.547-0.453-1-1-1h-2c-0.547 0-1 0.453-1 1v2c0 0.547 0.453 1 1 1h2c0.547 0 1-0.453 1-1zM22 25v-8c0-0.547-0.453-1-1-1h-12c-0.547 0-1 0.453-1 1v8c0 0.547 0.453 1 1 1h12c0.547 0 1-0.453 1-1zM6 7v-2c0-0.547-0.453-1-1-1h-2c-0.547 0-1 0.453-1 1v2c0 0.547 0.453 1 1 1h2c0.547 0 1-0.453 1-1zM28 25v-2c0-0.547-0.453-1-1-1h-2c-0.547 0-1 0.453-1 1v2c0 0.547 0.453 1 1 1h2c0.547 0 1-0.453 1-1zM22 13v-8c0-0.547-0.453-1-1-1h-12c-0.547 0-1 0.453-1 1v8c0 0.547 0.453 1 1 1h12c0.547 0 1-0.453 1-1zM28 19v-2c0-0.547-0.453-1-1-1h-2c-0.547 0-1 0.453-1 1v2c0 0.547 0.453 1 1 1h2c0.547 0 1-0.453 1-1zM28 13v-2c0-0.547-0.453-1-1-1h-2c-0.547 0-1 0.453-1 1v2c0 0.547 0.453 1 1 1h2c0.547 0 1-0.453 1-1zM28 7v-2c0-0.547-0.453-1-1-1h-2c-0.547 0-1 0.453-1 1v2c0 0.547 0.453 1 1 1h2c0.547 0 1-0.453 1-1zM30 4.5v21c0 1.375-1.125 2.5-2.5 2.5h-25c-1.375 0-2.5-1.125-2.5-2.5v-21c0-1.375 1.125-2.5 2.5-2.5h25c1.375 0 2.5 1.125 2.5 2.5z"
    },
    image: {
        width: 32, height: 32,
        path: "M20 12l-6 10-3.97-2.896-0.030-0.104-0.236-0.091 0.184 0.135-5.948 4.956v2h24v-2l-3-9-5-3zM9 13c1.656 0 3-1.343 3-3s-1.344-3-3-3-3 1.343-3 3 1.344 3 3 3zM31 2h-30c-0.552 0-1 0.448-1 1v26c0 0.553 0.448 1 1 1h30c0.553 0 1-0.447 1-1v-26c0-0.552-0.447-1-1-1zM30 27c0 0.553-0.447 1-1 1h-26c-0.552 0-1-0.447-1-1v-22c0-0.552 0.448-1 1-1h26c0.553 0 1 0.448 1 1v22z"
    },
    newPart: {
        width: 20, height: 20,
        path: "M10.001 7.8c-1.215 0-2.201 0.985-2.201 2.2s0.986 2.2 2.201 2.2c1.215 0 2.199-0.985 2.199-2.2s-0.984-2.2-2.199-2.2zM3.001 7.8c-1.215 0-2.201 0.985-2.201 2.2s0.986 2.2 2.201 2.2c1.215 0 2.199-0.986 2.199-2.2s-0.984-2.2-2.199-2.2zM17.001 7.8c-1.215 0-2.201 0.985-2.201 2.2s0.986 2.2 2.201 2.2c1.215 0 2.199-0.985 2.199-2.2s-0.984-2.2-2.199-2.2z"
    },
    dropCap: {
        width: 21, height: 21,
        path: "M1.033 17.57v-.942c0-.15.045-.263.136-.34.09-.08.2-.12.32-.12h18.62c.13 0 .23.04.32.118.09.08.14.192.14.34v.943c0 .1-.05.21-.14.31-.1.1-.21.15-.32.15H1.49c-.105 0-.21-.05-.31-.15-.1-.1-.15-.21-.15-.31zm0-10.135c.694 0 1.195-.058 1.502-.173l.122-.992h1.4v6.425c-.534.048-.88.105-1.038.17-.16.31-.26.682-.29 1.112h4.55c.04-.154.06-.35.05-.6s-.04-.44-.1-.57a5.595 5.595 0 0 0-1.26-.123V6.266h1.41c.12.654.18 1.01.2 1.067.32.083.81.123 1.45.123V5.04h-8v2.395zm10.395 5.916c0 .15.04.26.13.34.09.09.195.13.31.13h8.24c.115 0 .22-.04.316-.13a.417.417 0 0 0 .143-.32v-.94c0-.11-.048-.22-.15-.32-.1-.1-.202-.15-.31-.15h-8.23c-.11 0-.21.06-.305.16a.507.507 0 0 0-.144.33v.94-.01zm0-3.47c0 .13.04.23.13.32s.195.13.31.13h8.24c.115 0 .22-.04.316-.13a.396.396 0 0 0 .143-.31v-.95c0-.11-.048-.21-.143-.31a.429.429 0 0 0-.317-.15h-8.23c-.11 0-.21.05-.305.15a.472.472 0 0 0-.144.32v.94zm0-3.43a.445.445 0 0 0 .44.46h8.24c.115 0 .22-.04.316-.13a.402.402 0 0 0 .143-.32V5.5a.442.442 0 0 0-.143-.316.435.435 0 0 0-.317-.143h-8.23c-.11 0-.21.05-.305.15-.095.1-.143.2-.144.32v.95z"
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
export default function buildMenuItems(schema) {
    let r = {}, type;
    if (type = schema.marks.strong)
        r.toggleStrong = fromMenuItem.markItem(type, { title: "Toggle strong style", icon: icons.strong });
    if (type = schema.marks.em)
        r.toggleEm = fromMenuItem.markItem(type, { title: "Toggle emphasis", icon: icons.em });
    if (type = schema.marks.code)
        r.toggleCode = fromMenuItem.markItem(type, { title: "Toggle code font", icon: icons.code });
    if (type = schema.marks.link)
        r.toggleLink = fromMenuItem.linkItem(type);
    if (type = schema.marks.dropcap) {
        r.makeDropcap = fromMenuItem.makeDropcap(type, {
            title: "Dropcap",
            icon: customIcons.dropCap
        })
    }

    if (type = schema.nodes.image)
        r.insertImage = fromMenuItem.insertImageItem(type, {
            title: "Chèn hình",
            icon: customIcons.image
        })
    if (type = schema.nodes.bullet_list)
        r.wrapBulletList = fromMenuItem.wrapListItem(type, {
            title: "Wrap in bullet list",
            icon: icons.bulletList
        })
    if (type = schema.nodes.ordered_list)
        r.wrapOrderedList = fromMenuItem.wrapListItem(type, {
            title: "Wrap in ordered list",
            icon: icons.orderedList
        })
    if (type = schema.nodes.blockquote) {
        r.wrapBlockQuote = fromMenuItem.wrapBlockquote(type, {
            title: "Wrap in block quote",
            icon: icons.blockquote
        })
    }
    if (type = schema.nodes.horizontal_rule) {
        r.inserNewPart = fromMenuItem.horizonRuleItem(type, {
            title: "Thêm một phần mới",
            icon: customIcons.newPart
        })
    }

    if (type = schema.nodes.heading) {
        r.makeHead1 = fromMenuItem.makeHeading(1, {
            title: "Tiêu đề",
            icon: customIcons.biggerHeading
        });
        r.makeHead2 = fromMenuItem.makeHeading(2, {
            title: "Tiêu đề phụ",
            icon: customIcons.smallerHeading
        });
        r.makeHead3 = fromMenuItem.makeHeading(3, {
            title: "Đầu mục lớn",
            icon: customIcons.biggerHeading
        });
        r.makeHead4 = fromMenuItem.makeHeading(4, {
            title: "Đầu mục nhỏ",
            icon: customIcons.smallerHeading
        });
    }

    /**
     * Filter none-null item.
     * @param {Array} arr 
     */
    let cut = arr => arr.filter(x => x);
    r.inlineMenu = [cut([r.toggleStrong, r.toggleEm, r.toggleCode, r.toggleLink])];
    r.blockFormatMenu = [cut([r.makeHead1, r.makeHead3, r.makeHead2, r.makeHead4, r.makeParagraph, r.wrapBulletList, r.wrapOrderedList, r.wrapBlockQuote, r.makeDropcap])];
    r.blockInsertMenu = [cut([r.insertImage, r.inserNewPart])];
    r.fullMenu = r.inlineMenu.concat([[undoItem, redoItem]], r.blockFormatMenu);

    return r;
}