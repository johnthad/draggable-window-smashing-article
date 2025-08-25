import { html, css, LitElement } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { DragController } from './dragController';

class A2kWindow extends LitElement {
  static styles = css`
    :host {
      font-family: var(--font-primary);
    }

    #window {
      width: min(80ch, 100%);
    }

    #panel {
      border: var(--border-width) solid var(--color-gray-400);
      box-shadow: 2px 2px var(--color-black);
      background-color: var(--color-gray-500);
    }

    #draggable {
      background: linear-gradient(
        90deg,
        var(--color-blue-100) 0%,
        var(--color-blue-700) 100%
      );
      user-select: none;
    }

    #draggable p {
      font-weight: bold;
      margin: 0;
      color: white;
      padding: 2px 8px;
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
    this.heading = 'Building Retro Web Components with Lit';
  }

  drag = new DragController(this, {
    getContainerEl: () => this.shadowRoot.querySelector('#window'),
    getDraggableEl: () => this.getDraggableEl(),
  });

  async getDraggableEl() {
    await this.updateComplete;
    return this.shadowRoot.querySelector('#draggable');
  }

  render() {
    return html`
      <div id="window" style=${styleMap(this.drag.styles)}>
        <div id="panel">
          <div id="draggable" data-dragging=${this.drag.state}>
            <p>${this.heading}</p>
          </div>
          <slot></slot>
        </div>
      </div>
    `;
  }
}

customElements.define('a2k-window', A2kWindow);
