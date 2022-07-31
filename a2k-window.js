import { html, css, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { DragController } from "./dragController";

// import "@a2000/panel/a2k-panel.js";

export class A2kWindow extends LitElement {
  static styles = css`
    :host {
      font-family: var(--font-primary);
    }

    #window {
      position: absolute;
      width: 80ch;
      max-width: 100%;
    }

    #draggable {
      width: 100%;
      position: relative;
    }

    [data-dragging="idle"] {
      cursor: grab;
    }

    [data-dragging="dragging"] {
      cursor: grabbing;
    }
  `;

  drag = new DragController(this, {
    containerId: "#window",
  });

  render() {
    return html`
      <div id="window" style=${styleMap(this.drag.styles)}>
        <a2k-panel>
          <div id="draggable" ${this.drag.applyDrag()}>
            <p>${this.heading}</p>
          </div>
          <slot></slot>
        </a2k-panel>
      </div>
    `;
  }
}

customElements.define("a2k-window", A2kWindow);
