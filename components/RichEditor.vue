<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      codeBlock: { languageClassPrefix: 'language-' }
    }),
    Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    Underline,
    Placeholder.configure({ placeholder: props.placeholder || 'Write your article content here...' }),
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
  editorProps: {
    attributes: {
      class: 'prose-editor focus:outline-none min-h-[320px] p-5 text-sm leading-relaxed text-ink'
    }
  }
})

// Sync external value changes (e.g. when editing a post)
watch(() => props.modelValue, (newVal) => {
  if (editor.value && editor.value.getHTML() !== newVal) {
    editor.value.commands.setContent(newVal, false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function setLink() {
  const url = window.prompt('Enter URL:', editor.value?.getAttributes('link').href || 'https://')
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}
</script>

<template>
  <div class="rich-editor border border-black/[0.08] rounded-xl overflow-hidden bg-[#FAFAF7] focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap items-center gap-0.5 p-2 bg-white border-b border-black/[0.06]">
      <!-- Headings -->
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="['toolbar-btn', editor.isActive('heading', { level: 2 }) ? 'active' : '']"
        title="Heading 2"
      >H2</button>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="['toolbar-btn', editor.isActive('heading', { level: 3 }) ? 'active' : '']"
        title="Heading 3"
      >H3</button>

      <div class="toolbar-divider"></div>

      <!-- Text formatting -->
      <button
        type="button"
        @click="editor.chain().focus().toggleBold().run()"
        :class="['toolbar-btn', editor.isActive('bold') ? 'active' : '']"
        title="Bold"
      ><strong>B</strong></button>
      <button
        type="button"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="['toolbar-btn', editor.isActive('italic') ? 'active' : '']"
        title="Italic"
      ><em>I</em></button>
      <button
        type="button"
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="['toolbar-btn', editor.isActive('underline') ? 'active' : '']"
        title="Underline"
      ><span style="text-decoration:underline">U</span></button>
      <button
        type="button"
        @click="editor.chain().focus().toggleStrike().run()"
        :class="['toolbar-btn', editor.isActive('strike') ? 'active' : '']"
        title="Strikethrough"
      ><s>S</s></button>
      <button
        type="button"
        @click="editor.chain().focus().toggleCode().run()"
        :class="['toolbar-btn font-mono', editor.isActive('code') ? 'active' : '']"
        title="Inline Code"
      >`</button>

      <div class="toolbar-divider"></div>

      <!-- Lists -->
      <button
        type="button"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="['toolbar-btn', editor.isActive('bulletList') ? 'active' : '']"
        title="Bullet List"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="['toolbar-btn', editor.isActive('orderedList') ? 'active' : '']"
        title="Numbered List"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" stroke="currentColor" stroke-width="1.5"/><path d="M4 10h2" stroke="currentColor" stroke-width="1.5"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" stroke="currentColor" stroke-width="1.5"/></svg>
      </button>

      <div class="toolbar-divider"></div>

      <!-- Block elements -->
      <button
        type="button"
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="['toolbar-btn', editor.isActive('blockquote') ? 'active' : '']"
        title="Blockquote"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleCodeBlock().run()"
        :class="['toolbar-btn', editor.isActive('codeBlock') ? 'active' : '']"
        title="Code Block"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().setHorizontalRule().run()"
        class="toolbar-btn"
        title="Horizontal Rule"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      <div class="toolbar-divider"></div>

      <!-- Link -->
      <button
        type="button"
        @click="setLink"
        :class="['toolbar-btn', editor.isActive('link') ? 'active' : '']"
        title="Insert Link"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
      </button>

      <div class="toolbar-divider"></div>

      <!-- History -->
      <button
        type="button"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().chain().focus().undo().run()"
        class="toolbar-btn disabled:opacity-30"
        title="Undo"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>
      </button>
      <button
        type="button"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().chain().focus().redo().run()"
        class="toolbar-btn disabled:opacity-30"
        title="Redo"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 014-4h12"/></svg>
      </button>
    </div>

    <!-- Editor Area -->
    <EditorContent :editor="editor" />
  </div>
</template>

<style>
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #3A3A3C;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.toolbar-btn:hover { background: rgba(28,28,30,0.06); }
.toolbar-btn.active { background: #1C1C1E; color: #fff; }
.toolbar-divider { width: 1px; height: 20px; background: rgba(28,28,30,0.1); margin: 0 4px; }

/* TipTap editor content styles */
.prose-editor h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 600; color: #1C1C1E; margin-top: 1.5rem; margin-bottom: 0.75rem; line-height: 1.3; }
.prose-editor h3 { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 600; color: #1C1C1E; margin-top: 1.2rem; margin-bottom: 0.5rem; line-height: 1.3; }
.prose-editor p { margin-bottom: 1rem; color: #3A3A3C; }
.prose-editor strong { font-weight: 600; color: #1C1C1E; }
.prose-editor em { font-style: italic; }
.prose-editor ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
.prose-editor ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
.prose-editor li { margin-bottom: 0.25rem; color: #3A3A3C; }
.prose-editor a { color: #D4622A; text-decoration: underline; }
.prose-editor blockquote { border-left: 3px solid #D4622A; padding-left: 1rem; color: #8E8E93; font-style: italic; margin: 1rem 0; }
.prose-editor pre { background: #F0F0ED; border-radius: 8px; padding: 1rem; overflow-x: auto; margin-bottom: 1rem; }
.prose-editor code { font-family: 'DM Mono', monospace; font-size: 0.85em; background: rgba(28,28,30,0.06); padding: 0.15em 0.3em; border-radius: 4px; }
.prose-editor pre code { background: none; padding: 0; }
.prose-editor hr { border: none; border-top: 1px solid rgba(28,28,30,0.08); margin: 1.5rem 0; }
.prose-editor p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #8E8E93; pointer-events: none; float: left; height: 0; }
</style>
