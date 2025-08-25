import { html, css, LitElement } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { DragController } from './dragController';

class DraggableToolbar extends LitElement {
  static styles = css`
    :host {
      --toolbar-bg: #333;
      --toolbar-color: #fff;
      --toolbar-background: #fff;
      --handle-bg: #66ccff;
    }

    #toolbar-container {
      position: absolute; /* Allows for dragging anywhere on the page */
      display: flex;
      flex-direction: column;
      background-color: var(--toolbar-bg);
      border-radius: var(--border-radius);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      color: var(--toolbar-color);
      z-index: 1000;
      user-select: none; /* Prevents text selection during drag */
      top: 50px; /* Initial position */
      left: 50px;
    }

    #toolbar-content {
      border: var(--border-width) solid var(--color-gray-400);
      box-shadow: 2px 2px var(--color-black);
      background-color: var(--toolbar-background);
      padding: 3px;
    }

    ::slotted(*) {
      margin: 5px;
    }

    #drag-handle {
      background-color: var(--handle-bg);
      padding: 4px;
      border-top-left-radius: var(--border-radius);
      border-top-right-radius: var(--border-radius);
      text-align: left;
      user-select: none;
    }

    #drag-handle p {
      font-family: sans-serif;
      font-weight: bold;
      font-variant: small-caps;
      margin: 0;
      color: black;
    }

    [data-dragging='idle'] {
      cursor: grab;
    }

    [data-dragging='dragging'] {
      cursor: grabbing;
    }
  `;

  static properties = {
    heading: {},
  };

  constructor() {
    super();
    this.heading = '';
  }

  drag = new DragController(this, {
    getContainerEl: () => this.shadowRoot.querySelector('#toolbar-container'),
    getDraggableEl: () => this.getDraggableEl(),
  });

  async getDraggableEl() {
    await this.updateComplete;
    return this.shadowRoot.querySelector('#drag-handle');
  }

  render() {
    return html`
      <div id="toolbar-container" style=${styleMap(this.drag.styles)}>
        <div id="drag-handle" data-dragging=${this.drag.state}>
          <p>${this.heading}</p>
        </div>
        <div id="toolbar-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('draggable-toolbar', DraggableToolbar);
