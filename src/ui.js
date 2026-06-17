import { groupByCategory } from './inventory.js';

const STYLE_ID = 'cp-consent-styles';
const PRIMARY = '#57bce8';

export function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .cp-overlay {
      position: fixed;
      inset: 0;
      background: rgba(255, 255, 255, 0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483646;
      padding: 16px;
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      line-height: 1.4;
      color: #141414;
    }

    .cp-modal {
      background: #ffffff;
      border: 1px solid #d6d6d6;
      border-radius: 0;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
      width: 100%;
      max-width: 820px;
      max-height: 92vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-sizing: border-box;
    }

    .cp-header {
      border-bottom: 1px solid #d6d6d6;
      padding: 0 24px;
    }

    .cp-tabs {
      display: flex;
      gap: 0;
      margin: 0;
      padding: 0;
    }

    .cp-tab {
      appearance: none;
      background: transparent;
      border: none;
      border-bottom: 3px solid transparent;
      color: #141414;
      cursor: pointer;
      flex: 1;
      font-family: inherit;
      font-size: 15px;
      font-weight: 400;
      line-height: 1.2;
      margin: 0;
      padding: 18px 12px 14px;
      text-align: center;
      transition: color 0.15s ease, border-color 0.15s ease;
    }

    .cp-tab:hover {
      color: ${PRIMARY};
    }

    .cp-tab:focus-visible {
      outline: 2px solid ${PRIMARY};
      outline-offset: -2px;
    }

    .cp-tab-active {
      border-bottom-color: ${PRIMARY};
      color: ${PRIMARY};
      font-weight: 600;
    }

    .cp-body {
      flex: 1;
      overflow: auto;
      padding: 28px 32px 20px;
    }

    .cp-panel {
      display: block;
    }

    .cp-title {
      margin: 0 0 16px;
      font-size: 18px;
      font-weight: 700;
      line-height: 1.35;
    }

    .cp-description {
      margin: 0;
      font-size: 14px;
      line-height: 1.55;
      color: #141414;
    }

    .cp-link {
      color: ${PRIMARY};
      text-decoration: underline;
    }

    .cp-link:hover {
      text-decoration: none;
    }

    .cp-category {
      border-bottom: 1px solid #d6d6d6;
      padding: 16px 0;
    }

    .cp-category:first-child {
      padding-top: 0;
    }

    .cp-category-header {
      align-items: center;
      display: flex;
      gap: 10px;
    }

    .cp-category-toggle {
      align-items: center;
      appearance: none;
      background: transparent;
      border: none;
      color: #141414;
      cursor: pointer;
      display: inline-flex;
      flex-shrink: 0;
      height: 24px;
      justify-content: center;
      line-height: 1;
      padding: 0;
      width: 24px;
    }

    .cp-category-toggle:focus-visible {
      outline: 2px solid ${PRIMARY};
      outline-offset: 2px;
    }

    .cp-category-toggle-icon {
      border: solid currentColor;
      border-width: 0 2px 2px 0;
      display: inline-block;
      height: 7px;
      transform: rotate(45deg);
      transition: transform 0.2s ease;
      width: 7px;
    }

    .cp-category-collapsed .cp-category-toggle-icon {
      transform: rotate(-45deg);
    }

    .cp-category-title-wrap {
      align-items: center;
      display: flex;
      flex: 1;
      gap: 8px;
      min-width: 0;
    }

    .cp-category-title {
      font-size: 15px;
      font-weight: 700;
      margin: 0;
    }

    .cp-category-description {
      color: #141414;
      font-size: 14px;
      line-height: 1.55;
      margin: 12px 0 0 28px;
    }

    .cp-category-collapsed .cp-category-description,
    .cp-category-collapsed .cp-inventory-list {
      display: none;
    }

    .cp-category-badge {
      background: #eeeeee;
      border-radius: 999px;
      color: #141414;
      font-size: 12px;
      font-weight: 600;
      line-height: 1;
      min-width: 24px;
      padding: 4px 8px;
      text-align: center;
    }

    .cp-inventory-list {
      list-style: none;
      margin: 12px 0 0 28px;
      padding: 0;
    }

    .cp-inventory-item {
      border-top: 1px solid #eeeeee;
      font-size: 13px;
      line-height: 1.45;
      padding: 10px 0;
    }

    .cp-inventory-item:first-child {
      border-top: none;
      padding-top: 0;
    }

    .cp-inventory-item-name {
      font-weight: 600;
      margin: 0 0 4px;
    }

    .cp-inventory-item-meta {
      color: #555555;
      margin: 0;
    }

    .cp-inventory-item-description {
      color: #141414;
      margin: 4px 0 0;
    }

    .cp-switch {
      flex-shrink: 0;
      height: 24px;
      position: relative;
      width: 44px;
    }

    .cp-switch input {
      height: 0;
      opacity: 0;
      position: absolute;
      width: 0;
    }

    .cp-switch-slider {
      background: #141414;
      border-radius: 999px;
      cursor: pointer;
      inset: 0;
      position: absolute;
      transition: background 0.2s ease;
    }

    .cp-switch-slider::before {
      background: #ffffff;
      border-radius: 50%;
      content: "";
      height: 18px;
      left: 3px;
      position: absolute;
      top: 3px;
      transition: transform 0.2s ease;
      width: 18px;
    }

    .cp-switch input:checked + .cp-switch-slider {
      background: ${PRIMARY};
    }

    .cp-switch input:checked + .cp-switch-slider::before {
      transform: translateX(20px);
    }

    .cp-switch input:focus-visible + .cp-switch-slider {
      outline: 2px solid ${PRIMARY};
      outline-offset: 2px;
    }

    .cp-switch input:disabled + .cp-switch-slider {
      cursor: not-allowed;
      opacity: 0.85;
    }

    .cp-footer-meta {
      border-top: 1px solid #d6d6d6;
      color: #141414;
      font-size: 13px;
      line-height: 1.5;
      padding: 14px 32px;
    }

    .cp-actions {
      border-top: 1px solid #d6d6d6;
      display: flex;
      gap: 8px;
      padding: 16px;
    }

    .cp-btn {
      appearance: none;
      background: ${PRIMARY};
      border: none;
      border-radius: 4px;
      color: #141414;
      cursor: pointer;
      flex: 1;
      font-family: inherit;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.2;
      min-height: 48px;
      padding: 12px 16px;
      transition: filter 0.15s ease;
    }

    .cp-btn:hover {
      filter: brightness(0.96);
    }

    .cp-btn:focus-visible {
      outline: 2px solid #141414;
      outline-offset: 2px;
    }

    .cp-btn-accept {
      background: #3dd802;
    }

    .cp-btn-accept:hover {
      filter: brightness(0.94);
    }

    .cp-hidden {
      display: none !important;
    }

    @media (max-width: 640px) {
      .cp-body {
        padding: 20px 16px 16px;
      }

      .cp-footer-meta {
        padding: 12px 16px;
      }

      .cp-actions {
        flex-direction: column;
      }

      .cp-tab {
        font-size: 14px;
        padding: 16px 8px 12px;
      }
    }
  `;

  document.head.appendChild(style);
}

/**
 * @param {HTMLElement} container
 * @param {HTMLElement} dialog
 */
function trapFocus(container, dialog) {
  const focusableSelector =
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function handleKeyDown(event) {
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = Array.from(dialog.querySelectorAll(focusableSelector));
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * @typedef {'consent' | 'details' | 'about'} ConsentTab
 */

/**
 * @typedef {Object} ConsentUIHandlers
 * @property {() => void} onAcceptAll
 * @property {() => void} onRejectAll
 * @property {(preferences: { analytics: boolean; marketing: boolean }) => void} onSavePreferences
 */

/**
 * @param {import('./config.js').DEFAULT_CONFIG} config
 * @param {import('./inventory.js').CookieInventory | null} inventory
 * @param {ConsentUIHandlers} handlers
 * @returns {{ destroy: () => void; showPreferences: () => void }}
 */
export function renderConsentUI(config, inventory, handlers) {
  injectStyles();

  const groupedInventory = groupInventory(config, inventory);

  const previousActiveElement = document.activeElement;
  const overlay = document.createElement('div');
  overlay.className = 'cp-overlay';
  overlay.setAttribute('role', 'presentation');

  const modal = document.createElement('div');
  modal.className = 'cp-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'cp-consent-title');

  const header = document.createElement('div');
  header.className = 'cp-header';

  const tabs = document.createElement('div');
  tabs.className = 'cp-tabs';
  tabs.setAttribute('role', 'tablist');

  /** @type {Record<ConsentTab, HTMLButtonElement>} */
  const tabButtons = {};
  /** @type {Record<ConsentTab, HTMLElement>} */
  const panels = {};

  /** @type {ConsentTab} */
  let activeTab = 'consent';

  const body = document.createElement('div');
  body.className = 'cp-body';

  const consentPanel = document.createElement('div');
  consentPanel.className = 'cp-panel';
  consentPanel.dataset.panel = 'consent';
  consentPanel.setAttribute('role', 'tabpanel');

  const title = document.createElement('h2');
  title.id = 'cp-consent-title';
  title.className = 'cp-title';
  title.textContent = config.texts.title;

  const description = document.createElement('p');
  description.className = 'cp-description';
  description.textContent = config.texts.description;

  if (config.privacyPolicyUrl) {
    const privacyLink = document.createElement('a');
    privacyLink.className = 'cp-link';
    privacyLink.href = config.privacyPolicyUrl;
    privacyLink.textContent = config.texts.privacyPolicy;
    privacyLink.target = '_blank';
    privacyLink.rel = 'noopener noreferrer';
    description.appendChild(document.createTextNode(' '));
    description.appendChild(privacyLink);
  }

  consentPanel.append(title, description);
  panels.consent = consentPanel;

  const detailsPanel = document.createElement('div');
  detailsPanel.className = 'cp-panel cp-hidden';
  detailsPanel.dataset.panel = 'details';
  detailsPanel.setAttribute('role', 'tabpanel');

  const functionalSwitch = createCategorySwitch(
    config.texts.categories.functional,
    groupedInventory.functional,
    true,
    true,
    config
  );
  const analyticsSwitch = createCategorySwitch(
    config.texts.categories.analytics,
    groupedInventory.analytics,
    false,
    false,
    config
  );
  const marketingSwitch = createCategorySwitch(
    config.texts.categories.marketing,
    groupedInventory.marketing,
    false,
    false,
    config
  );

  /** @type {Array<{ collapse: () => void }>} */
  const categorySwitches = [functionalSwitch, analyticsSwitch, marketingSwitch];

  detailsPanel.append(
    functionalSwitch.element,
    analyticsSwitch.element,
    marketingSwitch.element
  );

  if (config.showUnclassified && groupedInventory.unclassified.length > 0) {
    const unclassifiedSection = createCategorySwitch(
      config.texts.categories.unclassified,
      groupedInventory.unclassified,
      false,
      true,
      config
    );
    categorySwitches.push(unclassifiedSection);
    detailsPanel.appendChild(unclassifiedSection.element);
  }
  panels.details = detailsPanel;

  const aboutPanel = document.createElement('div');
  aboutPanel.className = 'cp-panel cp-hidden';
  aboutPanel.dataset.panel = 'about';
  aboutPanel.setAttribute('role', 'tabpanel');

  const aboutTitle = document.createElement('h2');
  aboutTitle.className = 'cp-title';
  aboutTitle.textContent = config.texts.aboutTitle;

  const aboutDescription = document.createElement('p');
  aboutDescription.className = 'cp-description';
  aboutDescription.textContent = config.texts.aboutDescription;

  if (config.privacyPolicyUrl) {
    const aboutLink = document.createElement('a');
    aboutLink.className = 'cp-link';
    aboutLink.href = config.privacyPolicyUrl;
    aboutLink.textContent = config.texts.privacyPolicy;
    aboutLink.target = '_blank';
    aboutLink.rel = 'noopener noreferrer';
    aboutDescription.appendChild(document.createTextNode(' '));
    aboutDescription.appendChild(aboutLink);
  }

  aboutPanel.append(aboutTitle, aboutDescription);
  panels.about = aboutPanel;

  body.append(consentPanel, detailsPanel, aboutPanel);

  const footerMeta = document.createElement('div');
  footerMeta.className = 'cp-footer-meta cp-hidden';
  const footerDate = inventory?.scannedAt
    ? formatInventoryDate(inventory.scannedAt)
    : formatDate(new Date());
  footerMeta.textContent = config.texts.lastUpdated.replace('{date}', footerDate);

  const actions = document.createElement('div');
  actions.className = 'cp-actions';

  const denyBtn = document.createElement('button');
  denyBtn.type = 'button';
  denyBtn.className = 'cp-btn cp-btn-deny';
  denyBtn.textContent = config.texts.rejectAll;
  denyBtn.addEventListener('click', handlers.onRejectAll);

  const middleBtn = document.createElement('button');
  middleBtn.type = 'button';
  middleBtn.className = 'cp-btn cp-btn-middle';

  const acceptBtn = document.createElement('button');
  acceptBtn.type = 'button';
  acceptBtn.className = 'cp-btn cp-btn-accept';
  acceptBtn.textContent = config.texts.acceptAll;
  acceptBtn.addEventListener('click', handlers.onAcceptAll);

  actions.append(denyBtn, middleBtn, acceptBtn);

  for (const tab of /** @type {ConsentTab[]} */ (['consent', 'details', 'about'])) {
    const tabButton = document.createElement('button');
    tabButton.type = 'button';
    tabButton.className = 'cp-tab';
    tabButton.dataset.tab = tab;
    tabButton.setAttribute('role', 'tab');
    tabButton.setAttribute('aria-selected', tab === activeTab ? 'true' : 'false');
    tabButton.textContent = config.texts.tabs[tab];
    tabButton.addEventListener('click', () => setActiveTab(tab));
    tabButtons[tab] = tabButton;
    tabs.appendChild(tabButton);
  }

  header.appendChild(tabs);
  modal.append(header, body, footerMeta, actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  updateMiddleButton();
  setActiveTab(activeTab);

  const releaseFocusTrap = trapFocus(overlay, modal);
  acceptBtn.focus();

  function updateMiddleButton() {
    middleBtn.replaceChildren();

    if (activeTab === 'consent') {
      middleBtn.textContent = config.texts.customize;
      const chevron = document.createElement('span');
      chevron.setAttribute('aria-hidden', 'true');
      chevron.textContent = ' ›';
      middleBtn.appendChild(chevron);
      middleBtn.onclick = () => setActiveTab('details');
      return;
    }

    middleBtn.textContent = config.texts.savePreferences;
    middleBtn.onclick = () => {
      handlers.onSavePreferences({
        analytics: analyticsSwitch.input.checked,
        marketing: marketingSwitch.input.checked,
      });
    };
  }

  function collapseAllCategories() {
    for (const categorySwitch of categorySwitches) {
      categorySwitch.collapse();
    }
  }

  /** @param {ConsentTab} tab */
  function setActiveTab(tab) {
    activeTab = tab;

    for (const [name, button] of Object.entries(tabButtons)) {
      const isActive = name === tab;
      button.classList.toggle('cp-tab-active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }

    for (const [name, panel] of Object.entries(panels)) {
      panel.classList.toggle('cp-hidden', name !== tab);
    }

    if (tab === 'details') {
      collapseAllCategories();
    }

    footerMeta.classList.toggle('cp-hidden', tab !== 'details');
    updateMiddleButton();
  }

  function showPreferences() {
    setActiveTab('details');
    functionalSwitch.element.querySelector('.cp-category-toggle')?.focus();
  }

  function destroy() {
    releaseFocusTrap();
    overlay.remove();
    if (previousActiveElement instanceof HTMLElement) {
      previousActiveElement.focus();
    }
  }

  return { destroy, showPreferences };
}

/**
 * @param {Date} date
 */
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * @param {import('./config.js').DEFAULT_CONFIG} config
 * @param {import('./inventory.js').CookieInventory | null} inventory
 */
function groupInventory(config, inventory) {
  return groupByCategory(inventory, config.showUnclassified);
}

/**
 * @param {string} isoDate
 */
function formatInventoryDate(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return formatDate(new Date());
  }
  return formatDate(date);
}

/**
 * @param {{ title: string; description: string }} category
 * @param {import('./inventory.js').InventoryItem[]} items
 * @param {boolean} checked
 * @param {boolean} disabled
 * @param {import('./config.js').DEFAULT_CONFIG} config
 */
function createCategorySwitch(category, items, checked, disabled, config) {
  const element = document.createElement('div');
  element.className = 'cp-category cp-category-collapsed';

  const header = document.createElement('div');
  header.className = 'cp-category-header';

  const expandBtn = document.createElement('button');
  expandBtn.type = 'button';
  expandBtn.className = 'cp-category-toggle';
  expandBtn.setAttribute('aria-expanded', 'false');
  expandBtn.setAttribute('aria-label', category.title);

  const expandIcon = document.createElement('span');
  expandIcon.className = 'cp-category-toggle-icon';
  expandIcon.setAttribute('aria-hidden', 'true');
  expandBtn.appendChild(expandIcon);

  expandBtn.addEventListener('click', () => {
    const collapsed = element.classList.toggle('cp-category-collapsed');
    expandBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  });

  function collapse() {
    element.classList.add('cp-category-collapsed');
    expandBtn.setAttribute('aria-expanded', 'false');
  }

  const titleWrap = document.createElement('div');
  titleWrap.className = 'cp-category-title-wrap';

  const categoryTitle = document.createElement('h3');
  categoryTitle.className = 'cp-category-title';
  categoryTitle.textContent = category.title;

  if (items.length > 0) {
    const badge = document.createElement('span');
    badge.className = 'cp-category-badge';
    badge.textContent = String(items.length);
    titleWrap.append(categoryTitle, badge);
  } else {
    titleWrap.appendChild(categoryTitle);
  }

  const label = document.createElement('label');
  label.className = 'cp-switch';
  label.setAttribute('aria-label', category.title);

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.disabled = disabled;
  input.setAttribute('role', 'switch');
  input.setAttribute('aria-checked', String(checked));

  input.addEventListener('change', () => {
    input.setAttribute('aria-checked', String(input.checked));
  });

  const slider = document.createElement('span');
  slider.className = 'cp-switch-slider';
  slider.setAttribute('aria-hidden', 'true');

  label.append(input, slider);
  header.append(expandBtn, titleWrap, label);

  const categoryDescription = document.createElement('p');
  categoryDescription.className = 'cp-category-description';
  categoryDescription.textContent = category.description;

  element.append(header, categoryDescription);

  if (items.length > 0) {
    const list = document.createElement('ul');
    list.className = 'cp-inventory-list';

    for (const item of items) {
      const listItem = document.createElement('li');
      listItem.className = 'cp-inventory-item';

      const name = document.createElement('p');
      name.className = 'cp-inventory-item-name';
      name.textContent = item.name;
      listItem.appendChild(name);

      const metaParts = [];
      if (item.provider) {
        metaParts.push(`${config.texts.inventory.providerLabel}: ${item.provider}`);
      }
      if (item.type) {
        metaParts.push(item.type);
      }
      if (item.retention) {
        metaParts.push(`${config.texts.inventory.retentionLabel}: ${item.retention}`);
      }

      if (metaParts.length > 0) {
        const meta = document.createElement('p');
        meta.className = 'cp-inventory-item-meta';
        meta.textContent = metaParts.join(' · ');
        listItem.appendChild(meta);
      }

      if (item.description) {
        const itemDescription = document.createElement('p');
        itemDescription.className = 'cp-inventory-item-description';
        itemDescription.textContent = item.description;
        listItem.appendChild(itemDescription);
      }

      list.appendChild(listItem);
    }

    element.appendChild(list);
  }

  return { element, input, collapse };
}
