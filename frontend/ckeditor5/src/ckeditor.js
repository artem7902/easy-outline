/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import DecoupledDocumentEditor from '@ckeditor/ckeditor5-editor-decoupled/src/decouplededitor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';

class Editor extends DecoupledDocumentEditor {}

// Plugins to include in the build.
Editor.builtinPlugins = [
	Essentials,
	GeneralHtmlSupport,
	Paragraph
];

// Editor configuration.
Editor.defaultConfig = {
	toolbar: {
		items: [
		]
	},
	language: 'en',
	htmlSupport: {
		allow: [
			{
				name: /mark/,
				attributes: true,
				classes: true,
				styles: true
			}
		]
	}
};

export default Editor;
