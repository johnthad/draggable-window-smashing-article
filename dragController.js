import { noChange } from "lit";
import { Directive, directive, PartType } from "lit/directive.js";
import PointerTracker from "pointer-tracker";

const getSmallestValue = (a, b) => (a <= b ? a : b);

class DragDirective extends Directive {
  hasInitialised = false;

  constructor(partInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error("The `drag` directive must be used on an element");
    }
  }

  update(part, renderArgs) {
    if (this.hasInitialised) return;

    const draggableElement = part.element;
    const [dragController, pointerTrackerOptions] = renderArgs;

    draggableElement.setAttribute("data-dragging", "idle");
    dragController.draggableElement = draggableElement;

    dragController.pointerTracker = new PointerTracker(draggableElement, {
      start(...args) {
        pointerTrackerOptions.start(...args);
        draggableElement.setAttribute("data-dragging", "dragging");
        return true;
      },
      move(...args) {
        pointerTrackerOptions.move(...args);
      },
      end(...args) {
        pointerTrackerOptions.end(...args);
        draggableElement.setAttribute("data-dragging", "idle");
      },
    });

    this.hasInitialised = true;
  }

  render() {
    return noChange;
  }
}

const dragDirective = directive(DragDirective);

export class DragController {
  host;

  cursorPositionX = null;
  cursorPositionY = null;
  pointerTracker = null;
  draggableElement = null;
  containerElement = null;
  containerId = "";

  styles = {
    touchAction: "none",
    top: "0px",
    left: "0px",
  };

  constructor(host, options) {
    this.host = host;
    this.host.addController(this);

    const { initialPosition = {}, containerId = "" } = options;

    this.styles = {
      ...this.styles,
      ...initialPosition,
    };

    this.containerId = containerId;
  }

  hostDisconnected() {
    if (this.pointerTracker) {
      this.pointerTracker.stop();
    }
  }

  applyDrag() {
    if (!this.host.draggable) return null;

    return dragDirective(this, {
      start: this.#onDragStart,
      move: this.#onDrag,
      end: this.#onDragEnd,
    });
  }

  updateElPosition(x, y) {
    this.styles = {
      ...this.styles,
      left: x,
      top: y,
    };
  }

  handleWindowMove(pointer) {
    const el = this.draggableElement;
    const containerEl = this.host.shadowRoot?.querySelector(this.containerId);

    if (!el || !containerEl) return;
    const { top, left } = this.styles;

    const parsedTop = Number(top?.replace("px", ""));
    const parsedLeft = Number(left?.replace("px", ""));
    const pageX = Math.floor(pointer.pageX);
    const pageY = Math.floor(pointer.pageY);

    if (pageX !== this.cursorPositionX || pageY !== this.cursorPositionY) {
      const { bottom, height } = el.getBoundingClientRect();
      const { right, width } = containerEl.getBoundingClientRect();

      // window.inner* and screen.avail* had problems depending on where they're used
      // doing this check ensures that the draggable box never extends beyond the screen
      const availableWidth = getSmallestValue(screen.availWidth, innerWidth);
      const availableHeight = getSmallestValue(screen.availHeight, innerHeight);

      const xDelta = pageX - this.cursorPositionX;
      const yDelta = pageY - this.cursorPositionY;
      const outOfBoundsTop = parsedTop + yDelta < 0;
      const outOfBoundsLeft = parsedLeft + xDelta < 0;
      const outOfBoundsBottom = bottom + yDelta > availableHeight;
      const outOfBoundsRight = right + xDelta >= availableWidth;
      const isOutOfBounds =
        outOfBoundsBottom ||
        outOfBoundsLeft ||
        outOfBoundsRight ||
        outOfBoundsTop;

      this.cursorPositionX = pageX;
      this.cursorPositionY = pageY;

      if (!isOutOfBounds) {
        const top = `${parsedTop + yDelta}px`;
        const left = `${parsedLeft + xDelta}px`;

        this.updateElPosition(left, top);
      } else {
        // This logic is flawed, as a window can be out of bounds top + bottom at the same time
        if (outOfBoundsTop) {
          const left = `${parsedLeft + xDelta}px`;

          this.updateElPosition(left, "0px");
        } else if (outOfBoundsLeft) {
          const top = `${parsedTop + yDelta}px`;

          this.updateElPosition("0px", top);
        } else if (outOfBoundsBottom) {
          const top = `${availableHeight - height}px`;
          const left = `${parsedLeft + xDelta}px`;

          this.updateElPosition(left, top);
        } else if (outOfBoundsRight) {
          const top = `${parsedTop + yDelta}px`;
          const left = `${Math.floor(availableWidth - width)}px`;

          this.updateElPosition(left, top);
        }
      }

      this.host.requestUpdate();
    }
  }

  #onDragStart = (pointer, ev) => {
    this.cursorPositionX = Math.floor(pointer.pageX);
    this.cursorPositionY = Math.floor(pointer.pageY);

    const el = ev.target;
    el.setAttribute("data-state", "dragging");

    return true;
  };

  #onDrag = (_previousPointers, pointers) => {
    const [pointer] = pointers;
    const el = this.draggableElement;
    const containerEl = this.host.shadowRoot?.querySelector(this.containerId);

    const event = new CustomEvent("window-drag", {
      bubbles: true,
      composed: true,
      detail: {
        pointer,
        containerEl,
        draggableEl: el,
      },
    });

    window.requestAnimationFrame(() => {
      this.host.dispatchEvent(event);
      return this.handleWindowMove(pointer);
    });
  };

  #onDragEnd = (_pointer, ev) => {
    const el = ev.target;
    el.removeAttribute("data-state");
  };
}
