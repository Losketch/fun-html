import { html } from 'lit';
import { __decorate } from 'tslib';
import { customElement } from 'lit/decorators.js';
import { ListItemEl as ListItem } from '@material/web/list/internal/listitem/list-item.js';
import { styles } from '@material/web/list/internal/listitem/list-item-styles.js';

export let MdListItem = class MdListItem extends ListItem {
  render() {
    return this.renderListItem(html`
      <md-item part="item">
        <div slot="container">
          ${this.renderRipple()} ${this.renderFocusRing()}
        </div>
        <slot name="start" slot="start"></slot>
        <slot name="end" slot="end"></slot>
        ${this.renderBody()}
      </md-item>
    `);
  }
};

MdListItem.styles = [styles];
MdListItem = __decorate([customElement('md-list-item')], MdListItem);
