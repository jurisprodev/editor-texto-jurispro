<template>
    <div class="ww-rich-text" :class="{ '-readonly': isReadonly, editing: isEditing }" data-capture>
        <template v-if="richEditor">
            <div class="ww-rich-text__menu native-menu" v-if="!hideMenu && !content.customMenu" :style="menuStyles">
                <!-- Texte type (normal, ...) -->
                <select id="rich-size" v-model="currentTextType" :disabled="!isEditable" v-if="menu.textType">
                    <option v-for="option in textTypeOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>

                <span class="separator" v-if="menu.textType"></span>

                <!-- Bold, Italic, Underline -->
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="toggleBold"
                    :class="{ 'is-active': richEditor.isActive('bold') }"
                    :disabled="!isEditable"
                    v-if="menu.bold"
                >
                    <i class="fas fa-bold"></i>
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="toggleItalic"
                    :class="{ 'is-active': richEditor.isActive('italic') }"
                    :disabled="!isEditable"
                    v-if="menu.italic"
                >
                    <i class="fas fa-italic"></i>
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="toggleUnderline"
                    :class="{ 'is-active': richEditor.isActive('underline') }"
                    :disabled="!isEditable"
                    v-if="menu.underline"
                >
                    <i class="fas fa-underline"></i>
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="toggleStrike"
                    :class="{ 'is-active': richEditor.isActive('strike') }"
                    :disabled="!isEditable"
                    v-if="menu.strike"
                >
                    <i class="fas fa-strikethrough"></i>
                </button>

                <!-- Show the separator only if at least on of the previous block are visible -->
                <span class="separator" v-if="menu.bold || menu.italic || menu.underline || menu.strike"></span>

                <!-- Text align -->
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="setTextAlign('left')"
                    :class="{ 'is-active': richEditor.isActive({ textAlign: 'left' }) }"
                    :disabled="!isEditable"
                    v-if="menu.alignLeft"
                >
                    <i class="fas fa-align-left"></i>
                </button>

                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="setTextAlign('center')"
                    :class="{ 'is-active': richEditor.isActive({ textAlign: 'center' }) }"
                    :disabled="!isEditable"
                    v-if="menu.alignCenter"
                >
                    <i class="fas fa-align-center"></i>
                </button>

                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="setTextAlign('right')"
                    :class="{ 'is-active': richEditor.isActive({ textAlign: 'right' }) }"
                    :disabled="!isEditable"
                    v-if="menu.alignRight"
                >
                    <i class="fas fa-align-right"></i>
                </button>

                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="setTextAlign('justify')"
                    :class="{ 'is-active': richEditor.isActive({ textAlign: 'justify' }) }"
                    :disabled="!isEditable"
                    v-if="menu.alignJustify"
                >
                    <i class="fas fa-align-justify"></i>
                </button>

                <span
                    class="separator"
                    v-if="menu.alignLeft || menu.alignCenter || menu.alignRight || menu.alignJustify"
                ></span>
                
                <!-- Indent/Outdent -->
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="indent"
                    :class="{ 'is-active': editorStates.indentLevel > 0 }"
                    :disabled="!isEditable"
                    v-if="menu.indent"
                >
                    <indent-icon icon="indent" />
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="outdent"
                    :disabled="!isEditable || editorStates.indentLevel <= 0"
                    v-if="menu.outdent"
                >
                    <indent-icon icon="outdent" />
                </button>

                <span class="separator" v-if="menu.indent || menu.outdent"></span>

                <!-- Color -->
                <label
                    class="ww-rich-text__menu-item"
                    :for="`rich-color-${randomUid}`"
                    @click="richEditor.commands.focus()"
                    v-if="menu.textColor"
                >
                    <i class="fas fa-palette"></i>
                    <input
                        :id="`rich-color-${randomUid}`"
                        type="color"
                        @input="setColor($event.target.value)"
                        :value="richEditor.getAttributes('textStyle').color"
                        style="display: none"
                        :disabled="!isEditable"
                    />
                </label>

                <span class="separator" v-if="menu.textColor"></span>

                <!-- List (Bullet, number) -->
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="toggleBulletList"
                    :class="{ 'is-active': richEditor.isActive('bulletList') }"
                    :disabled="!isEditable"
                    v-if="menu.bulletList"
                >
                    <i class="fas fa-list-ul"></i>
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="toggleOrderedList"
                    :class="{ 'is-active': richEditor.isActive('orderedList') }"
                    :disabled="!isEditable"
                    v-if="menu.orderedList"
                >
                    <i class="fas fa-list-ol"></i>
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="toggleTaskList"
                    :class="{ 'is-active': richEditor.isActive('taskList') }"
                    :disabled="!isEditable"
                    v-if="menu.taskList"
                >
                    <i class="fas fa-check-square"></i>
                </button>

                <!-- Table -->
                <span class="separator" v-if="menu.table"></span>

                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    :class="{ 'is-highlighted': richEditor.isActive('table') }"
                    @click="insertTable"
                    :disabled="!isEditable"
                    v-if="menu.table"
                >
                    <table-icon icon="table-insert" />
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    :class="{ 'is-highlighted': richEditor.isActive('table') }"
                    @click="insertRow('before')"
                    :disabled="!isEditable"
                    v-if="menu.table && richEditor.isActive('table')"
                >
                    <table-icon icon="row-insert-before" />
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    :class="{ 'is-highlighted': richEditor.isActive('table') }"
                    @click="insertRow('after')"
                    :disabled="!isEditable"
                    v-if="menu.table && richEditor.isActive('table')"
                >
                    <table-icon icon="row-insert-after" />
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    :class="{ 'is-highlighted': richEditor.isActive('table') }"
                    @click="insertColumn('before')"
                    :disabled="!isEditable"
                    v-if="menu.table && richEditor.isActive('table')"
                >
                    <table-icon icon="column-inster-before" />
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    :class="{ 'is-highlighted': richEditor.isActive('table') }"
                    @click="insertColumn('after')"
                    :disabled="!isEditable"
                    v-if="menu.table && richEditor.isActive('table')"
                >
                    <table-icon icon="column-insert-after" />
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    :class="{ 'is-highlighted': richEditor.isActive('table') }"
                    @click="deleteRow"
                    :disabled="!isEditable"
                    v-if="menu.table && richEditor.isActive('table')"
                >
                    <table-icon icon="row-delete" />
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    :class="{ 'is-highlighted': richEditor.isActive('table') }"
                    @click="deleteColumn"
                    :disabled="!isEditable"
                    v-if="menu.table && richEditor.isActive('table')"
                >
                    <table-icon icon="column-delete" />
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    :class="{ 'is-highlighted': richEditor.isActive('table') }"
                    @click="deleteTable"
                    :disabled="!isEditable"
                    v-if="menu.table && richEditor.isActive('table')"
                >
                    <table-icon icon="table-delete" />
                </button>

                <span class="separator" v-if="menu.bulletList || menu.orderedList || menu.taskList"></span>

                <!-- Link -->
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="setLink()"
                    :class="{ 'is-active': richEditor.isActive('link') }"
                    :disabled="!isEditable"
                    v-if="menu.link"
                >
                    <i class="fas fa-link"></i>
                </button>

                <!-- Image -->
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="setImage()"
                    :disabled="!isEditable"
                    v-if="menu.image"
                >
                    <i class="fas fa-image"></i>
                </button>

                <!-- Code -->
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="toggleCodeBlock"
                    :class="{ 'is-active': richEditor.isActive('codeBlock') }"
                    :disabled="!isEditable"
                    v-if="menu.codeBlock"
                >
                    <i class="fas fa-code"></i>
                </button>

                <!-- Quote -->
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="toggleBlockquote"
                    :class="{ 'is-active': richEditor.isActive('blockquote') }"
                    :disabled="!isEditable"
                    v-if="menu.blockquote"
                >
                    <i class="fas fa-quote-left"></i>
                </button>

                <span class="separator" v-if="menu.link || menu.image || menu.codeBlock || menu.blockquote"></span>

                <!-- Undo/Redo -->
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="undo"
                    :disabled="!isEditable"
                    v-if="menu.undo"
                >
                    <i class="fas fa-undo"></i>
                </button>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="redo"
                    :disabled="!isEditable"
                    v-if="menu.redo"
                >
                    <i class="fas fa-redo"></i>
                </button>
                
                <!-- Variable -->
                <span class="separator" v-if="menu.variable"></span>
                <button
                    type="button"
                    class="ww-rich-text__menu-item"
                    @click="toggleVariable"
                    :class="{ 'is-active': richEditor.isActive('variable') }"
                    :disabled="!isEditable"
                    v-if="menu.variable"
                >
                    <i class="fas fa-code"></i>
                </button>

                <!-- Adicionar após a seção de indentação e antes da tabela ou link -->
                <span class="separator" v-if="menu.lineHeight"></span>

                <select v-if="menu.lineHeight" 
                        :disabled="!isEditable" 
                        v-model="currentLineHeight" 
                        @change="setLineHeight(currentLineHeight)"
                        class="ww-rich-text__menu-item line-height-select">
                    <option value="normal">Normal</option>
                    <option value="1">1</option>
                    <option value="1.15">1.15</option>
                    <option value="1.5">1.5</option>
                    <option value="2">2</option>
                    <option value="2.5">2.5</option>
                    <option value="3">3</option>
                </select>
            </div>
            <wwElement class="ww-rich-text__menu" v-else-if="content.customMenu" v-bind="content.customMenuElement" />

            <editor-content class="ww-rich-text__input" :editor="richEditor" :style="richStyles" />
        </template>
    </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { Variable } from './extensions/Variable';
import { Indent } from './extensions/Indent';
import { LineHeight } from './extensions/LineHeight';
import { ClipboardTextSerializer } from './extensions/ClipboardTextSerializer';
import IndentIcon from './icons/indent-icons.vue';
import LineHeightIcon from './icons/line-height-icon.vue';

import { computed, inject } from 'vue';
import suggestion from './suggestion.js';
import { Markdown } from 'tiptap-markdown';
import TableIcon from './icons/table-icon.vue';

function extractMentions(acc, currentNode) {
    if (currentNode.type === 'mention') {
        acc.push(currentNode.attrs.id);
        return acc;
    } else if (currentNode.content) {
        return currentNode.content.reduce(extractMentions, acc);
    } else {
        return acc;
    }
}

const TAGS_MAP = {
    p: 0,
    h1: 1,
    h2: 2,
    h3: 3,
    h4: 4,
    h5: 5,
    h6: 6,
};

export default {
    components: {
        EditorContent,
        TableIcon,
        IndentIcon,
        LineHeightIcon,
    },
    props: {
        content: { type: Object, required: true },
        uid: { type: String, required: true },
        wwElementState: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        wwFrontState: { type: Object, required: true },
        /* wwEditor:end */
        useForm: { type: Boolean, default: true },
    },
    emits: ['trigger-event', 'update:content:effect', 'update:sidepanel-content'],
    setup(props, { emit }) {
        const { value: variableValue, setValue } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'value',
            type: 'string',
            defaultValue: computed(() => String(props.content.initialValue || '')),
        });

        const { value: variableMentions, setValue: setMentions } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'mentions',
            type: 'array',
            defaultValue: [],
            readonly: true,
        });

        const { value: states, setValue: setStates } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'states',
            type: 'object',
            defaultValue: {},
            readonly: true,
        });
        
        // Adicionar variáveis de componente para suporte a variáveis
        const { value: variableVariables, setValue: setVariables } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'variables',
            type: 'array',
            defaultValue: [],
            readonly: true,
        });

        const { value: variableSelected, setValue: setSelected } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'selected',
            type: 'string',
            defaultValue: '',
            readonly: true,
        });

        const { value: variableSelectedInfo, setValue: setSelectedInfo } = wwLib.wwVariable.useComponentVariable({
            uid: props.uid,
            name: 'selectedInfo',
            type: 'object',
            defaultValue: { 
                ativo: false, 
                posicao: { x: 0, y: 0 },
                dimensao: { largura: 0, altura: 0 },
                texto: {
                    comprimento: 0,
                    linhas: 0
                },
                menuPosicao: 'nenhuma'
            },
            readonly: true,
        });

        /* wwEditor:start */
        const { createElement } = wwLib.useCreateElement();
        /* wwEditor:end */

        const randomUid = wwLib.wwUtils.getUid();

        const useForm = inject('_wwForm:useForm', () => {});

        const fieldName = computed(() => props.content.fieldName);
        const validation = computed(() => props.content.validation);
        const customValidation = computed(() => props.content.customValidation);

        useForm(
            variableValue,
            { fieldName, validation, customValidation },
            { elementState: props.wwElementState, emit, sidepanelFormPath: 'form' }
        );

        return {
            variableValue,
            setValue,
            variableMentions,
            setMentions,
            states,
            setStates,
            randomUid,
            /* wwEditor:start */
            createElement,
            /* wwEditor:end */
            variableVariables,
            setVariables,
            variableSelected,
            setSelected,
            variableSelectedInfo,
            setSelectedInfo,
        };
    },
    data: () => ({
        richEditor: null,
        loading: false,
        selectedText: '',
        selectedPosition: { x: 0, y: 0 },
    }),

    watch: {
        'content.initialValue'(value) {
            if (value !== this.getContent()) {
                this.richEditor.commands.setContent(value);
                this.setValue(value);
            }
            this.$emit('trigger-event', { name: 'initValueChange', event: { value } });

            if (this.isReadonly) this.handleOnUpdate();
        },
        isEditable(value) {
            this.richEditor.setEditable(value);
        },
        variableValue(value, oldValue) {
            if (value !== this.getContent()) this.richEditor.commands.setContent(value);
            // If format changed
            if (value !== this.getContent()) this.setValue(this.getContent());
        },
        /* wwEditor:start */
        editorConfig() {
            this.loadEditor();
        },
        'wwEditorState.boundProps.mentionList'(isBind) {
            if (!isBind)
                this.$emit('update:content:effect', {
                    mentionIdPath: null,
                    mentionLabelPath: null,
                });
        },
        // For updating legacy elements before introduction of custom menu
        'content.customMenu': {
            async handler(value) {
                if (value && !this.content.customMenuElement) {
                    const element = await this.createElement('ww-flexbox', {
                        _state: {
                            name: 'Custom menu container',
                            style: {
                                default: {
                                    width: '100%',
                                },
                            },
                        },
                    });
                    this.$emit('update:content:effect', {
                        customMenuElement: element,
                    });
                }
            },
            immediate: true,
        },
        'wwEditorState.isSelected'() {
            this.$emit('update:sidepanel-content', { path: 'selectedTag', value: null });
        },
        /* wwEditor:end */
        isReadonly: {
            immediate: true,
            handler(value) {
                if (value) {
                    this.$emit('add-state', 'readonly');
                } else {
                    this.$emit('remove-state', 'readonly');
                }
            },
        },
        editorStates: {
            deep: true,
            immediate: true,
            handler(value) {
                this.setStates(value);
            },
        },
    },
    computed: {
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        editorStates() {
            if (!this.richEditor) return {};
            return {
                textType: Object.keys(TAGS_MAP).find(key => TAGS_MAP[key] === this.currentTextType),
                textColor: this.currentColor,
                bold: this.richEditor.isActive('bold'),
                italic: this.richEditor.isActive('italic'),
                underline: this.richEditor.isActive('underline'),
                strike: this.richEditor.isActive('strike'),
                bulletList: this.richEditor.isActive('bulletList'),
                orderedList: this.richEditor.isActive('orderedList'),
                checkList: this.richEditor.isActive('taskList'),
                link: this.richEditor.isActive('link'),
                codeBlock: this.richEditor.isActive('codeBlock'),
                blockquote: this.richEditor.isActive('blockquote'),
                textAlign: this.richEditor.isActive({ textAlign: 'left' })
                    ? 'left'
                    : this.richEditor.isActive({ textAlign: 'center' })
                      ? 'center'
                      : this.richEditor.isActive({ textAlign: 'right' })
                        ? 'right'
                        : this.richEditor.isActive({ textAlign: 'justify' })
                          ? 'justify'
                          : false,
                table: this.richEditor.isActive('table'),
                variable: this.richEditor.isActive('variable'),
                indentLevel: this.richEditor.getAttributes('paragraph').indentLevel || 
                         this.richEditor.getAttributes('heading').indentLevel ||
                         this.richEditor.getAttributes('listItem').indentLevel || 0,
                lineHeight: this.richEditor.getAttributes('paragraph').lineHeight || 
                           this.richEditor.getAttributes('heading').lineHeight || 
                           this.richEditor.getAttributes('blockquote').lineHeight || 
                           this.richEditor.getAttributes('listItem').lineHeight || 
                           'normal',
            };
        },
        currentColor() {
            if (this.richEditor.getAttributes('textStyle')?.color)
                return this.richEditor.getAttributes('textStyle')?.color;
            else if (this.richEditor.isActive('link')) return this.content.a.color;
            else if (this.richEditor.isActive('codeBlock')) return this.content.code.color;
            else if (this.richEditor.isActive('blockquote')) return this.content.blockquote.color;
            else return this.content[Object.keys(TAGS_MAP).find(key => TAGS_MAP[key] === this.currentTextType)]?.color;
        },
        mentionList() {
            const data = wwLib.wwCollection.getCollectionData(this.content.mentionList);
            if (!Array.isArray(data)) return [];
            return data.map(mention => ({
                id: wwLib.resolveObjectPropertyPath(mention, this.content.mentionIdPath || 'id') || '',
                label: wwLib.resolveObjectPropertyPath(mention, this.content.mentionLabelPath || 'label') || '',
            }));
        },
        mentionListLength() {
            if (!this.content.mentionListLength || isNaN(this.content.mentionListLength)) return 5;
            return this.content.mentionListLength;
        },
        isReadonly() {
            return this.wwElementState.props.readonly === undefined
                ? this.content.readonly
                : this.wwElementState.props.readonly;
        },
        isEditable() {
            return !this.isReadonly && this.content.editable;
        },
        hideMenu() {
            return this.content.hideMenu || this.isReadonly;
        },
        menu() {
            return {
                textType: this.content.parameterTextType ?? true,
                bold: this.content.parameterBold ?? true,
                italic: this.content.parameterItalic ?? true,
                underline: this.content.parameterUnderline ?? true,
                strike: this.content.parameterStrike ?? true,
                alignLeft: this.content.parameterAlignLeft ?? false,
                alignCenter: this.content.parameterAlignCenter ?? false,
                alignRight: this.content.parameterAlignRight ?? false,
                alignJustify: this.content.parameterAlignJustify ?? false,
                textColor: this.content.parameterTextColor ?? true,
                bulletList: this.content.parameterBulletList ?? true,
                orderedList: this.content.parameterOrderedList ?? true,
                taskList: this.content.parameterTaskList ?? false,
                
                // Indentação
                indent: this.content.parameterIndent ?? true,
                outdent: this.content.parameterOutdent ?? true,

                table: this.content.parameterTable ?? false,

                link: this.content.parameterLink ?? true,
                image: this.content.parameterImage ?? false,
                codeBlock: this.content.parameterCodeBlock ?? true,
                blockquote: this.content.parameterQuote ?? true,
                undo: this.content.parameterUndo ?? true,
                redo: this.content.parameterRedo ?? true,
                variable: this.content.parameterVariable ?? false,
                lineHeight: this.content.parameterLineHeight ?? true,
            };
        },
        editorConfig() {
            return {
                placeholder: wwLib.wwLang.getText(this.content.placeholder),
                autofocus: this.content.autofocus,
                image: {
                    inline: this.content.img?.inline,
                    allowBase64: true,
                },
                mention: {
                    enabled: this.content.enableMention,
                    list: this.mentionList,
                    allowSpaces: this.content.mentionAllowSpaces,
                    char: this.content.mentionChar,
                },
            };
        },
        currentTextType: {
            get() {
                const currentType = this.textTypeOptions.find(option => option.active);
                return currentType ? currentType.value : 0;
            },
            set(value) {
                this.setTag(value);
            },
        },
        textTypeOptions() {
            if (!this.richEditor) return [];
            return [
                { label: 'Paragraph', value: 0, active: this.richEditor.isActive('paragraph') },
                { label: 'Heading 1', value: 1, active: this.richEditor.isActive('heading', { level: 1 }) },
                { label: 'Heading 2', value: 2, active: this.richEditor.isActive('heading', { level: 2 }) },
                { label: 'Heading 3', value: 3, active: this.richEditor.isActive('heading', { level: 3 }) },
                { label: 'Heading 4', value: 4, active: this.richEditor.isActive('heading', { level: 4 }) },
                { label: 'Heading 5', value: 5, active: this.richEditor.isActive('heading', { level: 5 }) },
                { label: 'Heading 6', value: 6, active: this.richEditor.isActive('heading', { level: 6 }) },
            ];
        },
        menuStyles() {
            return {
                '--menu-color': this.content.menuColor,
                'flex-wrap': this.content.wrapMenu ? 'wrap' : 'nowrap',
            };
        },
        richStyles() {
            return {
                display: 'flex',
                flex: 1,
                overflow: 'auto',
                // H1
                '--h1-fontSize': this.content.h1.fontSize,
                '--h1-fontFamily': this.content.h1.fontFamily,
                '--h1-fontWeight': this.content.h1.fontWeight,
                '--h1-textAlign': this.content.h1.textAlign,
                '--h1-color': this.content.h1.color,
                '--h1-lineHeight': this.content.h1.lineHeight,
                '--h1-margin-top': this.content.h1.marginTop,
                '--h1-margin-bottom': this.content.h1.marginBottom,
                // H2
                '--h2-fontSize': this.content.h2.fontSize,
                '--h2-fontFamily': this.content.h2.fontFamily,
                '--h2-fontWeight': this.content.h2.fontWeight,
                '--h2-textAlign': this.content.h2.textAlign,
                '--h2-color': this.content.h2.color,
                '--h2-lineHeight': this.content.h2.lineHeight,
                '--h2-margin-top': this.content.h2.marginTop,
                '--h2-margin-bottom': this.content.h2.marginBottom,
                // H3
                '--h3-fontSize': this.content.h3.fontSize,
                '--h3-fontFamily': this.content.h3.fontFamily,
                '--h3-fontWeight': this.content.h3.fontWeight,
                '--h3-textAlign': this.content.h3.textAlign,
                '--h3-color': this.content.h3.color,
                '--h3-lineHeight': this.content.h3.lineHeight,
                '--h3-margin-top': this.content.h3.marginTop,
                '--h3-margin-bottom': this.content.h3.marginBottom,
                // H4
                '--h4-fontSize': this.content.h4.fontSize,
                '--h4-fontFamily': this.content.h4.fontFamily,
                '--h4-fontWeight': this.content.h4.fontWeight,
                '--h4-textAlign': this.content.h4.textAlign,
                '--h4-color': this.content.h4.color,
                '--h4-lineHeight': this.content.h4.lineHeight,
                '--h4-margin-top': this.content.h4.marginTop,
                '--h4-margin-bottom': this.content.h4.marginBottom,
                // H5
                '--h5-fontSize': this.content.h5.fontSize,
                '--h5-fontFamily': this.content.h5.fontFamily,
                '--h5-fontWeight': this.content.h5.fontWeight,
                '--h5-textAlign': this.content.h5.textAlign,
                '--h5-color': this.content.h5.color,
                '--h5-lineHeight': this.content.h5.lineHeight,
                '--h5-margin-top': this.content.h5.marginTop,
                '--h5-margin-bottom': this.content.h5.marginBottom,
                // H6
                '--h6-fontSize': this.content.h6.fontSize,
                '--h6-fontFamily': this.content.h6.fontFamily,
                '--h6-fontWeight': this.content.h6.fontWeight,
                '--h6-textAlign': this.content.h6.textAlign,
                '--h6-color': this.content.h6.color,
                '--h6-lineHeight': this.content.h6.lineHeight,
                '--h6-margin-top': this.content.h6.marginTop,
                '--h6-margin-bottom': this.content.h6.marginBottom,
                // p
                '--p-fontSize': this.content.p.fontSize,
                '--p-fontFamily': this.content.p.fontFamily,
                '--p-fontWeight': this.content.p.fontWeight,
                '--p-textAlign': this.content.p.textAlign,
                '--p-color': this.content.p.color,
                '--p-lineHeight': this.content.p.lineHeight,
                '--p-margin-top': this.content.p.marginTop,
                '--p-margin-bottom': this.content.p.marginBottom,
                // mention
                '--mention-fontSize': this.content.mention.fontSize,
                '--mention-fontFamily': this.content.mention.fontFamily,
                '--mention-fontWeight': this.content.mention.fontWeight,
                '--mention-color': this.content.mention.color,
                '--mention-borderSize': this.content.mention.borderSize,
                '--mention-border-radius': this.content.mention.borderRadius,
                // a
                '--a-fontSize': this.content.a.fontSize,
                '--a-fontFamily': this.content.a.fontFamily,
                '--a-fontWeight': this.content.a.fontWeight,
                '--a-textAlign': this.content.a.textAlign,
                '--a-color': this.content.a.color,
                '--a-lineHeight': this.content.a.lineHeight,
                '--a-underline': this.content.a.isUnderline ? 'underline' : 'none',
                // blockquote
                '--blockquote-color': this.content.blockquote.color,
                '--blockquote-border-color': this.content.blockquote.borderColor,
                '--blockquote-margin-top': this.content.blockquote.marginTop,
                '--blockquote-margin-bottom': this.content.blockquote.marginBottom,
                // code
                '--code-color': this.content.code.color,
                '--code-bg-color': this.content.code.bgColor,
                '--code-border-radius': this.content.code.borderRadius,
                '--code-padding-y': this.content.code.paddingY,
                '--code-padding-x': this.content.code.paddingX,
                '--code-font-size': this.content.code.fontSize,
                // img
                '--img-max-width': this.content.img?.maxWidth,
                '--img-max-height': this.content.img?.maxHeight,
                // checkbox
                '--checkbox-color': this.content.checkbox?.color,
                // table
                '--table-border-color': this.content.table?.borderColor || '#C7C7C7',
                '--table-border-width': this.content.table?.borderWidth || '1px',
                '--table-header-bg-color': this.content.table?.headerBgColor || '#f5f5f5',
                '--table-header-color': this.content.table?.headerColor || '#000',
                '--table-pair-cell-bg-color': this.content.table?.pairCellBgColor || '#fff',
                '--table-odd-cell-bg-color': this.content.table?.oddCellBgColor || '#FDFDFD',
                '--table-cell-color': this.content.table?.cellColor || '#000',
                '--table-cell-padding-x': this.content.table?.cellPaddingX || '8px',
                '--table-cell-padding-y': this.content.table?.cellPaddingY || '6px',
                // Variáveis
                '--var-fontSize': this.content.var?.fontSize || '16px',
                '--var-fontFamily': this.content.var?.fontFamily || '',
                '--var-fontWeight': this.content.var?.fontWeight || '',
                '--var-color': this.content.var?.color || '#6366F1',
                '--var-bgColor': this.content.var?.bgColor || '#EEF2FF',
                '--var-borderSize': this.content.var?.borderSize || '1px',
                '--var-borderColor': this.content.var?.borderColor || '#A5B4FC',
                '--var-borderRadius': this.content.var?.borderRadius || '4px',
                '--var-padding': this.content.var?.padding || '2px 6px',
                // Indentação
                '--indent-size': '40px',
                '--indent-max-levels': '16',
            };
        },
        delay() {
            return wwLib.wwUtils.getLengthUnit(this.content.debounceDelay)[0];
        },
        currentLineHeight: {
            get() {
                return this.editorStates.lineHeight || 'normal';
            },
            set(value) {
                // Este setter é usado quando o select muda
                this.setLineHeight(value);
            }
        },
    },
    methods: {
        loadEditor() {
            if (this.loading) return;
            this.loading = true;
            if (this.richEditor) this.richEditor.destroy();
            this.richEditor = new Editor({
                content: String(this.content.initialValue || ''),
                editable: this.isEditable,
                autofocus: this.editorConfig.autofocus,
                onFocus: ({ editor, event }) => {
                    this.$emit('trigger-event', { name: 'focus', event: { editor, event } });
                },
                onBlur: ({ editor, event }) => {
                    this.$emit('trigger-event', { name: 'blur', event: { editor, event } });
                },
                onSelectionUpdate: ({ editor, transaction }) => {
                    this.handleSelection();
                },
                onUpdate: ({ editor, transaction }) => {
                    // Atualiza o valor quando o conteúdo muda
                    const content = this.getContent();
                    this.setValue(content);
                    
                    // Extrair variáveis e atualizar
                    const variables = this.extractVariables(content);
                    this.setVariables(variables);
                    
                    // Disparar evento de mudança
                    this.$emit('trigger-event', { name: 'change', event: { value: content } });
                    
                    // Atualizar o lineHeight nos estados
                    const currentLineHeight = editor.getAttributes('paragraph').lineHeight || 
                                           editor.getAttributes('heading').lineHeight || 
                                           editor.getAttributes('blockquote').lineHeight || 
                                           editor.getAttributes('listItem').lineHeight || 
                                           'normal';
                    
                    // Forçar atualização da variável states apenas se houver mudança
                    if (this.states?.lineHeight !== currentLineHeight) {
                        this.setStates({
                            ...this.states,
                            lineHeight: currentLineHeight
                        });
                    }
                },
                extensions: [
                    StarterKit,
                    Link.configure({
                        HTMLAttributes: {
                            rel: 'noopener noreferrer',
                        },
                    }),
                    TextStyle,
                    Color,
                    Underline,
                    Table.configure({
                        resizable: true,
                    }),
                    TableCell,
                    TableHeader,
                    TableRow,
                    TaskList,
                    TaskItem.configure({
                        nested: true,
                    }),
                    TextAlign.configure({
                        types: ['heading', 'paragraph'],
                    }),
                    Placeholder.configure({
                        placeholder: this.editorConfig.placeholder,
                    }),
                    Markdown.configure({ breaks: true }),
                    Image.configure({ ...this.editorConfig.image }),
                    
                    // Adicionar a extensão Variable
                    Variable.configure({
                        HTMLAttributes: {
                            class: 'variable',
                        }
                    }),
                    
                    // Adicionar a extensão Indent
                    Indent.configure({
                        types: ['paragraph', 'heading', 'listItem'],
                        defaultIndentLevel: 0,
                        minIndentLevel: 0,
                        maxIndentLevel: 16,
                        indentUnit: 'px',
                        indentSize: 40,
                    }),
                    
                    // Adicionar a extensão LineHeight
                    LineHeight.configure({
                        types: ['paragraph', 'heading', 'blockquote', 'listItem'],
                        defaultLineHeight: 'normal',
                        lineHeightOptions: ['normal', '1', '1.15', '1.5', '2', '2.5', '3']
                    }),
                    
                    // Adicionar a extensão ClipboardTextSerializer para limpeza ao colar
                    ClipboardTextSerializer.configure({
                        // Escolha um dos modos:
                        // 'plainText' - apenas texto puro sem formatação
                        // 'cleanHtml' - remove spans e estilos, mas mantém estrutura HTML básica
                        // 'smartClean' - tenta preservar formatações importantes e remover o resto
                        mode: 'cleanHtml'
                    }),
                    
                    this.editorConfig.mention.enabled &&
                        Mention.configure({
                            HTMLAttributes: {
                                class: 'mention',
                            },
                            suggestion: {
                                items: ({ query }) =>
                                    this.editorConfig.mention.list
                                        .filter(({ label }) => label.toLowerCase().startsWith(query.toLowerCase()))
                                        .slice(0, this.mentionListLength),
                                render: suggestion.render,
                                allowSpaces: this.editorConfig.mention.allowSpaces,
                                char: this.editorConfig.mention.char,
                            },
                        }),
                ],
                onCreate: () => {
                    this.setValue(this.getContent());
                    this.setMentions(this.richEditor.getJSON().content.reduce(extractMentions, []));
                    // Extrair variáveis na criação do editor
                    this.setVariables(this.extractVariables(this.getContent()));
                },
                editorProps: {
                    handleClickOn: (view, pos, node) => {
                        if (node.type.name === 'mention') {
                            this.$emit('trigger-event', {
                                name: 'mention:click',
                                event: { mention: { id: node.attrs.id, label: node.attrs.label } },
                            });
                        }
                    },
                },
            });
            this.loading = false;
        },
        handleOnUpdate() {
            let htmlValue = this.getContent();
            if (this.variableValue === htmlValue) return;
            
            // Atualiza o valor
            this.setValue(htmlValue);
            
            // Verifica a integridade das variáveis
            this.checkVariablesIntegrity();
            
            // Extrai variáveis
            const variables = this.extractVariables(htmlValue);
            this.setVariables(variables);
            
            // Restante do código existente para debounce e eventos
            if (this.content.debounce) {
                this.isDebouncing = true;
                if (this.debounce) {
                    clearTimeout(this.debounce);
                }
                this.debounce = setTimeout(() => {
                    this.$emit('trigger-event', { name: 'change', event: { value: this.variableValue } });
                    this.isDebouncing = false;
                }, this.delay);
            } else {
                this.$emit('trigger-event', { name: 'change', event: { value: this.variableValue } });
            }
            
            // Atualiza menções e outros estados
            this.setMentions(this.richEditor.getJSON().content.reduce(extractMentions, []));
        },
        // Método para verificar a integridade das variáveis
        checkVariablesIntegrity() {
            if (!this.richEditor) return false;
            
            const { state } = this.richEditor.view;
            const { doc } = state;
            const variableRegex = /\{\{([^}]+)\}\}/g;
            let modified = false;
            
            // 1. Verificar marcas de variável que não estão mais no formato {{...}}
            doc.descendants((node, pos) => {
                if (node.isText && node.marks.some(mark => mark.type.name === 'variable')) {
                    const text = node.text;
                    
                    // Se o texto não estiver no formato {{...}}, remove a marca
                    if (!/^\{\{.*\}\}$/.test(text)) {
                        this.richEditor.chain()
                            .setTextSelection({ from: pos, to: pos + text.length })
                            .unsetVariable()
                            .run();
                        modified = true;
                    } else {
                        // Se estiver no formato {{...}}, verifica se precisa normalizar
                        const normalizedText = this.getNormalizedVariableText(text);
                        if (normalizedText !== text) {
                            // Substitui o texto pelo texto normalizado
                            this.richEditor.chain()
                                .setTextSelection({ from: pos, to: pos + text.length })
                                .deleteSelection()
                                .insertContent(normalizedText)
                                .setTextSelection({
                                    from: pos,
                                    to: pos + normalizedText.length
                                })
                                .setVariable()
                                .run();
                            modified = true;
                        }
                    }
                }
            });
            
            // 2. Verificar textos no formato {{...}} sem marca de variável
            doc.descendants((node, pos) => {
                if (node.isText) {
                    const text = node.text;
                    let match;
                    
                    // Reinicia o regex para este nó
                    variableRegex.lastIndex = 0;
                    
                    // Encontra todas as ocorrências do padrão
                    while ((match = variableRegex.exec(text)) !== null) {
                        const matchedText = match[0]; // O texto completo coincidente (com {{...}})
                        const normalizedText = this.getNormalizedVariableText(matchedText);
                        const start = pos + match.index;
                        const end = start + matchedText.length;
                        
                        // Verificar se esta parte já está marcada como variável
                        const hasVariableMark = state.doc.rangeHasMark(start, end, state.schema.marks.variable);
                        
                        if (!hasVariableMark) {
                            // Adiciona a marca de variável
                            this.richEditor.chain()
                                .setTextSelection({ from: start, to: end })
                                .setVariable()
                                .run();
                            modified = true;
                        }
                        
                        // Se o texto precisa ser normalizado
                        if (normalizedText !== matchedText) {
                            this.richEditor.chain()
                                .setTextSelection({ from: start, to: end })
                                .deleteSelection()
                                .insertContent(normalizedText)
                                .setTextSelection({
                                    from: start,
                                    to: start + normalizedText.length
                                })
                                .setVariable()
                                .run();
                            modified = true;
                            
                            // Ajusta o índice do regex para considerar o novo texto
                            variableRegex.lastIndex = start + normalizedText.length - pos;
                        }
                    }
                }
            });
            
            return modified;
        },
        setLink(url) {
            if (this.richEditor.isActive('link')) {
                this.richEditor.chain().focus().unsetLink().run();
                return;
            }

            const previousUrl = this.richEditor.getAttributes('link').href;
            const selectedUrl = url ?? window.prompt('URL', previousUrl);

            // cancelled
            if (selectedUrl === null) {
                return;
            }

            // empty
            if (selectedUrl === '') {
                this.richEditor.chain().focus().extendMarkRange('link').unsetLink().run();

                return;
            }

            // update link
            this.richEditor.chain().focus().extendMarkRange('link').setLink({ href: selectedUrl }).run();
        },
        setImage(src, alt = '', title = '') {
            if (this.content.customMenu) this.richEditor.commands.setImage({ src, alt, title });
            else {
                let url;
                /* wwEditor:start */
                url = wwLib.getEditorWindow().prompt('Image URL');
                /* wwEditor:end */
                /* wwFront:start */
                url = wwLib.getFrontWindow().prompt('Image URL');
                /* wwFront:end */

                if (!url) return;
                this.richEditor.chain().focus().setImage({ src: url }).run();
            }
        },
        focusEditor() {
            this.richEditor.chain().focus().run();
        },
        setTag(tag) {
            if (typeof tag === 'string') {
                tag = tag.toLocaleLowerCase().trim();
                if (tag in TAGS_MAP) tag = TAGS_MAP[tag];
            }
            if (tag === 0) this.richEditor.chain().focus().setParagraph().run();
            if (tag !== 0)
                this.richEditor
                    .chain()
                    .focus()
                    .toggleHeading({ level: Number(tag) })
                    .run();
        },
        toggleUnderline() {
            this.richEditor.chain().focus().toggleMark('underline').run();
        },
        toggleBold() {
            this.richEditor.chain().focus().toggleBold().run();
        },
        toggleItalic() {
            this.richEditor.chain().focus().toggleItalic().run();
        },
        toggleStrike() {
            this.richEditor.chain().focus().toggleStrike().run();
        },
        setTextAlign(textAlign) {
            this.richEditor.chain().focus().setTextAlign(textAlign).run();
        },
        indent() {
            this.richEditor.chain().focus().indent().run();
        },
        outdent() {
            this.richEditor.chain().focus().outdent().run();
        },
        setColor(color) {
            this.richEditor.chain().focus().setColor(color).run();
        },
        toggleBulletList() {
            this.richEditor.chain().focus().toggleBulletList().run();
        },
        toggleOrderedList() {
            this.richEditor.chain().focus().toggleOrderedList().run();
        },
        toggleTaskList() {
            this.richEditor.chain().focus().toggleTaskList().run();
        },
        toggleCodeBlock() {
            this.richEditor.chain().focus().toggleCodeBlock().run();
        },
        toggleBlockquote() {
            this.richEditor.chain().focus().toggleBlockquote().run();
        },
        toggleVariable() {
            if (!this.richEditor) return;
            
            const { state } = this.richEditor.view;
            const { selection } = state;
            
            // Se não houver seleção, não faz nada
            if (selection.empty) return;
            
            const selectedText = state.doc.textBetween(selection.from, selection.to);
            
            // Verifica se já está ativo
            if (this.richEditor.isActive('variable')) {
                // Se já tiver a marca de variável, remove
                this.richEditor.chain().focus().unsetVariable().run();
                return;
            }
            
            // Se o texto já estiver no formato {{...}}, apenas aplica a marca
            if (/^\{\{.*\}\}$/.test(selectedText)) {
                this.richEditor.chain().focus().toggleVariable().run();
                return;
            }
            
            // Normaliza o texto e aplica a marca
            const normalizedText = this.getNormalizedVariableText(selectedText);
            
            // Remove a seleção atual e insere o texto normalizado
            this.richEditor.chain()
                .focus()
                .deleteSelection()
                .insertContent(normalizedText)
                .run();
            
            // Seleciona o texto inserido e aplica a marca
            const currentPos = this.richEditor.view.state.selection.from;
            const textLength = normalizedText.length;
            
            this.richEditor.chain()
                .focus()
                .setTextSelection({
                    from: currentPos - textLength,
                    to: currentPos
                })
                .toggleVariable()
                .run();
        },
        
        // Método para normalizar o texto para o formato de variável
        getNormalizedVariableText(text) {
            // Trim do texto
            let cleanText = text.trim();
            
            // Substitui espaços por hífens
            cleanText = cleanText.replace(/\s+/g, '-');
            
            // Substitui * por hífens
            cleanText = cleanText.replace(/\*/g, '-');
            
            // Normaliza caracteres especiais (acentos, etc)
            cleanText = cleanText.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            
            // Remove caracteres especiais (mantém apenas letras, números e hífens)
            cleanText = cleanText.replace(/[^a-zA-Z0-9-_]/g, '');
            
            // Retorna no formato {{...}}
            return `{{${cleanText}}}`;
        },
        undo() {
            this.richEditor.chain().undo().run();
        },
        redo() {
            this.richEditor.chain().redo().run();
        },
        getContent() {
            if (this.content.output === 'markdown') return this.richEditor.storage.markdown.getMarkdown();
            return this.richEditor.getHTML();
        },
        /* Table */
        insertTable() {
            this.richEditor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        },
        insertRow(direction) {
            direction === 'before'
                ? this.richEditor.chain().focus().addRowBefore().run()
                : this.richEditor.chain().focus().addRowAfter().run();
        },
        insertColumn(direction) {
            direction === 'before'
                ? this.richEditor.chain().focus().addColumnBefore().run()
                : this.richEditor.chain().focus().addColumnAfter().run();
        },
        deleteRow() {
            this.richEditor.chain().focus().deleteRow().run();
        },
        deleteColumn() {
            this.richEditor.chain().focus().deleteColumn().run();
        },
        deleteTable() {
            this.richEditor.chain().focus().deleteTable().run();
        },
        setLineHeight(lineHeight) {
            if (!this.richEditor) return;
            
            // Aplicar o line height ao editor
            this.richEditor.chain().focus().setLineHeight(lineHeight).run();
            
            // Após a alteração, atualize o estado explicitamente
            const currentLineHeight = this.richEditor.getAttributes('paragraph').lineHeight || 
                                     this.richEditor.getAttributes('heading').lineHeight || 
                                     this.richEditor.getAttributes('blockquote').lineHeight || 
                                     this.richEditor.getAttributes('listItem').lineHeight || 
                                     'normal';
            
            // Forçar atualização da variável states
            this.setStates({
                ...this.states,
                lineHeight: currentLineHeight
            });
        },
        extractVariables(content) {
            const regex = /\{\{([^}]+)\}\}/g;
            const variables = [];
            const variableMap = new Map();
            
            let match;
            while ((match = regex.exec(content)) !== null) {
                const variableName = `{{${match[1]}}}`;
                const normalizedName = this.getNormalizedVariableText(variableName);
                
                // Incrementa o contador para esta variável
                if (variableMap.has(normalizedName)) {
                    variableMap.set(normalizedName, variableMap.get(normalizedName) + 1);
                } else {
                    variableMap.set(normalizedName, 1);
                }
            }
            
            // Cria o array de variáveis
            let id = 1;
            for (const [variable, count] of variableMap.entries()) {
                variables.push({
                    id: id++,
                    tipo: "text",
                    value: null,
                    required: false,
                    variavel: variable,
                    inputNome: null,
                    repetido: String(count)
                });
            }
            
            return variables;
        },
        // Método para tratar seleção de texto
        handleSelection() {
            if (!this.richEditor) return;
            
            const { view } = this.richEditor;
            if (!view) return;
            
            const { state } = view;
            const { selection } = state;
            
            if (selection.empty) {
                this.setSelected('');
                this.setSelectedInfo({ 
                    ativo: false, 
                    posicao: { x: 0, y: 0 },
                    dimensao: { largura: 0, altura: 0 },
                    texto: { comprimento: 0, linhas: 0 },
                    menuPosicao: 'nenhuma'
                });
                
                // Atualizar status mesmo sem seleção
                const currentLineHeight = this.richEditor.getAttributes('paragraph').lineHeight || 
                                      this.richEditor.getAttributes('heading').lineHeight || 
                                      this.richEditor.getAttributes('blockquote').lineHeight || 
                                      this.richEditor.getAttributes('listItem').lineHeight || 
                                      'normal';
                
                // Forçar atualização da variável states apenas se houver mudança
                if (this.states?.lineHeight !== currentLineHeight) {
                    this.setStates({
                        ...this.states,
                        lineHeight: currentLineHeight
                    });
                }
                
                return;
            }
            
            // Obter o texto selecionado
            const selectedText = state.doc.textBetween(selection.from, selection.to);
            this.setSelected(selectedText);
            
            // Calcular a posição centralizada da seleção
            const startCoords = view.coordsAtPos(selection.from);
            const endCoords = view.coordsAtPos(selection.to);
            
            // Calcular dimensões e informações do texto
            const largura = Math.abs(endCoords.right - startCoords.left);
            const altura = Math.abs(endCoords.bottom - startCoords.top);
            const numLinhas = startCoords.top === endCoords.top ? 1 : 
                              Math.ceil((endCoords.bottom - startCoords.top) / 18); // Estimativa baseada em altura de linha
            
            // Obter as dimensões do componente para garantir que o menu esteja dentro dos limites
            const editorElement = view.dom.closest('.ww-rich-text');
            const editorRect = editorElement ? editorElement.getBoundingClientRect() : null;
            
            // Definir tamanho aproximado do menu
            const menuWidth = 200;
            const menuHeight = 40;
            
            let x = 0, y = 0, menuPosicao = 'acima';
            
            if (editorRect) {
                // Usar o algoritmo para encontrar a melhor posição
                const melhorPosicao = this.calcularMelhorPosicaoMenu(
                    startCoords, 
                    endCoords, 
                    editorRect, 
                    menuWidth, 
                    menuHeight
                );
                
                x = melhorPosicao.x;
                y = melhorPosicao.y;
                menuPosicao = melhorPosicao.posicao;
            } else {
                // Fallback caso não consiga encontrar o elemento editor
                if (startCoords.top === endCoords.top) {
                    // Seleção em uma única linha - centralizar horizontalmente
                    const selectionCenterX = startCoords.left + ((endCoords.left - startCoords.left) / 2);
                    x = Math.round(selectionCenterX - (menuWidth / 2));
                    y = Math.round(startCoords.top - menuHeight - 5);
                    menuPosicao = 'acima';
                } else {
                    // Seleção em múltiplas linhas - usar o início da primeira linha
                    x = Math.round(startCoords.left + Math.min(150, (endCoords.right - startCoords.left)) / 2 - (menuWidth / 2));
                    y = Math.round(startCoords.top - menuHeight - 5);
                    menuPosicao = 'acima';
                }
            }
            
            this.setSelectedInfo({
                ativo: true,
                posicao: {
                    x: x,
                    y: y
                },
                dimensao: {
                    largura: Math.round(largura),
                    altura: Math.round(altura)
                },
                texto: {
                    comprimento: selectedText.length,
                    linhas: numLinhas
                },
                menuPosicao: menuPosicao
            });
        },
        // Método para determinar a melhor posição para o menu
        calcularMelhorPosicaoMenu(startCoords, endCoords, editorRect, menuWidth, menuHeight) {
            // Calcular centro da seleção
            const selectionWidth = endCoords.right - startCoords.left;
            const selectionHeight = endCoords.bottom - startCoords.top;
            const selectionCenterX = startCoords.left + (selectionWidth / 2);
            const selectionCenterY = startCoords.top + (selectionHeight / 2);
            
            // Opção 1: Acima da seleção, centralizado horizontalmente
            const posicaoAcima = {
                x: selectionCenterX - (menuWidth / 2),
                y: startCoords.top - menuHeight - 5,
                posicao: 'acima'
            };
            
            // Opção 2: Abaixo da seleção, centralizado horizontalmente
            const posicaoAbaixo = {
                x: selectionCenterX - (menuWidth / 2),
                y: endCoords.bottom + 5,
                posicao: 'abaixo'
            };
            
            // Opção 3: À direita da seleção, centralizado verticalmente
            const posicaoDireita = {
                x: endCoords.right + 5,
                y: selectionCenterY - (menuHeight / 2),
                posicao: 'direita'
            };
            
            // Opção 4: À esquerda da seleção, centralizado verticalmente
            const posicaoEsquerda = {
                x: startCoords.left - menuWidth - 5,
                y: selectionCenterY - (menuHeight / 2),
                posicao: 'esquerda'
            };
            
            // Verificar qual posição tem melhor encaixe dentro do editor
            const opcoes = [posicaoAcima, posicaoAbaixo, posicaoDireita, posicaoEsquerda];
            
            // Pontuação para cada opção (quanto maior, melhor)
            const pontuacoes = opcoes.map(pos => {
                let pontos = 100;
                
                // Penalizar se estiver fora dos limites do editor
                if (pos.x < editorRect.left) pontos -= 20 * (editorRect.left - pos.x) / menuWidth;
                if (pos.x + menuWidth > editorRect.right) pontos -= 20 * (pos.x + menuWidth - editorRect.right) / menuWidth;
                if (pos.y < editorRect.top) pontos -= 20 * (editorRect.top - pos.y) / menuHeight;
                if (pos.y + menuHeight > editorRect.bottom) pontos -= 20 * (pos.y + menuHeight - editorRect.bottom) / menuHeight;
                
                // Preferência por posição acima ou abaixo (mais comum em UI)
                if (pos.posicao === 'acima' || pos.posicao === 'abaixo') pontos += 10;
                
                // Leve preferência por posição acima (mais comum em UI)
                if (pos.posicao === 'acima') pontos += 5;
                
                return pontos;
            });
            
            // Encontrar a melhor opção
            const melhorIndex = pontuacoes.indexOf(Math.max(...pontuacoes));
            let melhorPosicao = opcoes[melhorIndex];
            
            // Garantir que a posição está pelo menos parcialmente visível
            melhorPosicao.x = Math.max(melhorPosicao.x, editorRect.left);
            melhorPosicao.x = Math.min(melhorPosicao.x, editorRect.right - menuWidth);
            melhorPosicao.y = Math.max(melhorPosicao.y, editorRect.top);
            melhorPosicao.y = Math.min(melhorPosicao.y, editorRect.bottom - menuHeight);
            
            // Converter para valores relativos ao editor para maior precisão
            return {
                x: Math.round(melhorPosicao.x - editorRect.left),
                y: Math.round(melhorPosicao.y - editorRect.top),
                posicao: melhorPosicao.posicao
            };
        },
    },
    mounted() {
        this.loadEditor();
    },
    beforeUnmount() {
        if (this.richEditor) this.richEditor.destroy();
    },
};
</script>

<style lang="scss">
.ww-rich-text {
    --menu-color: unset;
    flex-direction: column;

    &.editing .ww-rich-text__input {
        position: relative;
        &::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
        }
    }

    &.editing .native-menu {
        position: relative;
        &::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 1;
        }
    }

    .separator {
        background: rgb(235, 236, 240);
        width: 1px;
        height: 24px;
        margin: 0px 8px;

        &:last-child {
            display: none;
        }
    }

    &__menu {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 4px;
        gap: 4px;
        overflow-x: auto;
        min-height: 32px;
        select {
            padding: 8px;
            appearance: none;
            border: none;
            font-weight: 700;
            cursor: pointer;
            color: var(--menu-color);
            background-color: transparent;
            &:hover {
                background-color: rgb(245, 245, 245);
            }
        }
        &-item {
            padding: 2px;
            color: var(--menu-color);
            cursor: pointer;
            text-align: center;
            border-radius: 4px;
            i {
                width: 24px;
            }
            .icon {
                color: var(--menu-color);
                display: flex;
                width: 24px;
                max-height: 16px;
            }
            &:hover {
                background-color: rgb(245, 245, 245);
            }
            &.is-active {
                color: white;
                background-color: var(--menu-color);
            }
        }
    }

    .ProseMirror {
        /* Basic editor styles */
        cursor: text;
        max-height: 100%;
        width: 100%;
        overflow: auto;
        padding: 8px;
        &-focused {
            outline: unset;
        }
        > * + * {
            margin-top: 0.75em;
        }

        /* Aplicar line-height aos elementos */
        p[style*="line-height"],
        h1[style*="line-height"],
        h2[style*="line-height"],
        h3[style*="line-height"],
        h4[style*="line-height"],
        h5[style*="line-height"],
        h6[style*="line-height"],
        blockquote[style*="line-height"],
        li[style*="line-height"] {
            /* Estilos são aplicados diretamente pelo atributo style */
        }

        /* Placeholder (at the top) */
        & p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: #adb5bd;
            pointer-events: none;
            height: 0;
        }
        
        /* Estilo para tag var */
        var {
            font-size: var(--var-fontSize);
            font-family: var(--var-fontFamily);
            font-weight: var(--var-fontWeight);
            font-style: normal;
            color: var(--var-color);
            background-color: var(--var-bgColor);
            border: var(--var-borderSize) solid var(--var-borderColor);
            border-radius: var(--var-borderRadius);
            padding: var(--var-padding);
        }
        
        /* Suporte para indentação */
        p[style*="padding-left"],
        h1[style*="padding-left"],
        h2[style*="padding-left"],
        h3[style*="padding-left"],
        h4[style*="padding-left"],
        h5[style*="padding-left"],
        h6[style*="padding-left"],
        li[style*="padding-left"] {
            position: relative;
        }

        /* Headings */
        h1 {
            font-size: var(--h1-fontSize);
            font-family: var(--h1-fontFamily);
            font-weight: var(--h1-fontWeight);
            text-align: var(--h1-textAlign);
            color: var(--h1-color);
            line-height: var(--h1-lineHeight);
            margin-top: var(--h1-margin-top);
            margin-bottom: var(--h1-margin-bottom);
        }
        h2 {
            font-size: var(--h2-fontSize);
            font-family: var(--h2-fontFamily);
            font-weight: var(--h2-fontWeight);
            text-align: var(--h2-textAlign);
            color: var(--h2-color);
            line-height: var(--h2-lineHeight);
            margin-top: var(--h2-margin-top);
            margin-bottom: var(--h2-margin-bottom);
        }
        h3 {
            font-size: var(--h3-fontSize);
            font-family: var(--h3-fontFamily);
            font-weight: var(--h3-fontWeight);
            text-align: var(--h3-textAlign);
            color: var(--h3-color);
            line-height: var(--h3-lineHeight);
            margin-top: var(--h3-margin-top);
            margin-bottom: var(--h3-margin-bottom);
        }
        h4 {
            font-size: var(--h4-fontSize);
            font-family: var(--h4-fontFamily);
            font-weight: var(--h4-fontWeight);
            text-align: var(--h4-textAlign);
            color: var(--h4-color);
            line-height: var(--h4-lineHeight);
            margin-top: var(--h4-margin-top);
            margin-bottom: var(--h4-margin-bottom);
        }
        h5 {
            font-size: var(--h5-fontSize);
            font-family: var(--h5-fontFamily);
            font-weight: var(--h5-fontWeight);
            text-align: var(--h5-textAlign);
            color: var(--h5-color);
            line-height: var(--h5-lineHeight);
            margin-top: var(--h5-margin-top);
            margin-bottom: var(--h5-margin-bottom);
        }
        h6 {
            font-size: var(--h6-fontSize);
            font-family: var(--h6-fontFamily);
            font-weight: var(--h6-fontWeight);
            text-align: var(--h6-textAlign);
            color: var(--h6-color);
            line-height: var(--h6-lineHeight);
            margin-top: var(--h6-margin-top);
            margin-bottom: var(--h6-margin-bottom);
        }
        p {
            font-size: var(--p-fontSize);
            font-family: var(--p-fontFamily);
            font-weight: var(--p-fontWeight);
            text-align: var(--p-textAlign);
            color: var(--p-color);
            line-height: var(--p-lineHeight);
            margin-top: var(--p-margin-top);
            margin-bottom: var(--p-margin-bottom);
        }
        a {
            display: initial;
            text-decoration: var(--a-underline);
            font-size: var(--a-fontSize);
            font-family: var(--a-fontFamily);
            font-weight: var(--a-fontWeight);
            text-align: var(--a-textAlign);
            color: var(--a-color);
            line-height: var(--a-lineHeight);
            cursor: pointer;
        }
        font-size: var(--p-fontSize);
        font-family: var(--p-fontFamily);
        font-weight: var(--p-fontSize);
        text-align: var(--p-textAlign);
        color: var(--p-color);
        line-height: var(--p-lineHeight);

        .mention {
            border: var(--mention-borderSize) solid var(--mention-color);
            border-radius: var(--mention-border-radius);
            padding: 0.1rem 0.3rem;
            box-decoration-break: clone;
            cursor: pointer;
            font-size: var(--mention-fontSize);
            font-family: var(--mention-fontFamily);
            font-weight: var(--mention-fontSize);
            color: var(--mention-color);
        }

        table {
            border-collapse: collapse;
            margin: 0;
            overflow: hidden;
            display: table;
            width: 100%;

            td,
            th {
                text-align: left;
                border: var(--table-border-width) solid var(--table-border-color);
                box-sizing: border-box;
                min-width: 1em;
                padding: var(--table-cell-padding-y) var(--table-cell-padding-x);
                position: relative;
                vertical-align: top;

                > * {
                    margin-bottom: 0;
                }
            }

            th {
                color: var(--table-header-color);
                font-style: normal;
                font-weight: 500;
                font-size: 15px;
                line-height: 18px;
                letter-spacing: -0.08px;
                background-color: var(--table-header-bg-color);
            }

            td {
                background-color: var(--table-pair-cell-bg-color);
                color: var(--table-cell-color);
            }

            tr:nth-child(odd) td {
                background-color: var(--table-odd-cell-bg-color);
            }

            /*
            .selectedCell:after {
                background: blue;
                content: '';
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                pointer-events: none;
                position: absolute;
                z-index: 2;
            }
                */

            .column-resize-handle {
                background-color: red;
                bottom: -2px;
                pointer-events: none;
                position: absolute;
                right: -2px;
                top: 0;
                width: 4px;
            }
        }

        .tableWrapper {
            margin: 1.5rem 0;
            overflow-x: auto;
        }

        &.resize-cursor {
            cursor: ew-resize;
            cursor: col-resize;
        }

        blockquote {
            color: var(--blockquote-color);
            border-left: 0.2rem solid var(--blockquote-border-color);
            margin: 1rem 0;
            padding: 0.25rem 0 0.25rem 1rem;
            margin-top: var(--blockquote-margin-top);
            margin-bottom: var(--blockquote-margin-bottom);
        }

        pre {
            background: var(--code-bg-color);
            color: var(--code-color);
            font-family: 'JetBrainsMono', monospace;
            padding: var(--code-padding-y) var(--code-padding-x);
            border-radius: var(--code-border-radius);

            code {
                color: inherit;
                padding: 0;
                background: none;
                font-size: var(--code-font-size);
            }
        }

        img {
            max-width: var(--img-max-width);
            max-height: var(--img-max-height);
        }

        ul[data-type='taskList'] {
            list-style: none;
            padding: 0;

            p {
                margin: 0;
            }

            li {
                display: flex;

                > label {
                    flex: 0 0 auto;
                    margin-right: var(--ww-spacing-01);
                    user-select: none;
                }

                > div {
                    flex: 1 1 auto;
                }

                ul li,
                ol li {
                    display: list-item;
                }

                ul[data-type='taskList'] > li {
                    display: flex;
                }

                input[type='checkbox'] {
                    cursor: pointer;
                    accent-color: var(--checkbox-color);
                }
            }
        }
    }

    &.-readonly .ProseMirror {
        cursor: inherit;
    }

    /* Estilos para line-height */
    p, h1, h2, h3, h4, h5, h6, blockquote, li {
        &[style*="line-height"] {
            display: block; /* Para garantir que o line-height seja aplicado corretamente */
        }
    }

    .line-height-select {
        padding: 2px 4px;
        font-size: 12px;
        border-radius: 4px;
        background-color: transparent;
        color: var(--menu-color);
        cursor: pointer;
    }

    .line-height-select:hover {
        background-color: rgb(245, 245, 245);
    }
}
</style>
