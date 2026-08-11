import {
  AuraRouter,
  AURA_ROUTER_NAVIGATION,
  AURA_ROUTER_NAVIGATION_ERROR,
  AURA_ROUTER_NAVIGATION_START,
} from '@auraui/router';
import './styles.css';

const pageSessionKey = 'aura-demo-document-loads';
const documentLoads = Number(sessionStorage.getItem(pageSessionKey) ?? '0') + 1;
sessionStorage.setItem(pageSessionKey, String(documentLoads));

const bootTime = new Date();
const bootToken = crypto.randomUUID().slice(0, 8);
let spaNavigations = 0;
let navigationStartedAt = 0;

const routeTitles = new Map([
  ['/', 'HTML-first navigation'],
  ['/about', 'How it works'],
  ['/migration', 'Migration guide'],
  ['/workspace', 'Nested layout demo'],
  ['/workspace/settings', 'Workspace settings'],
]);

function text(selector: string, value: string): void {
  const element = document.querySelector<HTMLElement>(selector);
  if (element) element.textContent = value;
}

function normalizePath(pathname: string): string {
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '');
}

function syncActiveLinks(pathname = window.location.pathname): void {
  const current = normalizePath(pathname);

  for (const link of document.querySelectorAll<HTMLAnchorElement>(
    '[data-site-nav] a, .workspace-sidebar nav a',
  )) {
    const target = normalizePath(new URL(link.href, window.location.href).pathname);
    const exact = current === target;
    const branch =
      link.closest('[data-site-nav]') !== null &&
      target === '/workspace' &&
      current.startsWith('/workspace/');

    link.classList.toggle('is-active', exact || branch);
    if (exact || branch) {
      link.setAttribute('aria-current', exact ? 'page' : 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

function syncDocumentTitle(pathname = window.location.pathname): void {
  const routePath = normalizePath(new URL(pathname, window.location.href).pathname);
  const heading = document.querySelector<HTMLElement>('#content h1');
  const title = routeTitles.get(routePath) ?? heading?.textContent?.trim() ?? 'Demo';
  document.title = `${title} — Aura Router`;
}

function syncWorkspaceInstance(): void {
  const shell = document.querySelector<HTMLElement>('[data-workspace-shell]');
  if (!shell) return;

  if (!shell.dataset.instance) {
    shell.dataset.instance = crypto.randomUUID().slice(0, 6);
  }

  const output = shell.querySelector<HTMLElement>('[data-shell-instance]');
  if (output) output.textContent = shell.dataset.instance;
}

function renderStatus(lastNavigation = 'HTML arrived. Aura is ready.'): void {
  text('[data-document-load]', `#${documentLoads}`);
  text('[data-boot-token]', bootToken);
  text(
    '[data-boot-time]',
    bootTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  );
  text('[data-spa-count]', String(spaNavigations));
  text('[data-last-navigation]', lastNavigation);
}

function announce(message: string): void {
  text('[data-route-announcer]', '');
  requestAnimationFrame(() => text('[data-route-announcer]', message));
}

function focusPageHeading(): void {
  const heading = document.querySelector<HTMLElement>('#content h1');
  if (!heading) return;
  heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
}

function handleCopy(button: HTMLButtonElement): void {
  const target = document.querySelector<HTMLElement>(button.dataset.copy ?? '');
  if (!target) return;

  void navigator.clipboard.writeText(target.textContent ?? '').then(() => {
    const previous = button.textContent;
    button.textContent = 'Copied!';
    window.setTimeout(() => {
      button.textContent = previous;
    }, 1400);
  });
}

async function waitForBootstrap(router: AuraRouter): Promise<void> {
  const deadline = performance.now() + 3_000;
  while (router.activeRouteBranch.length === 0 && performance.now() < deadline) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
}

async function boot(): Promise<void> {
  const router = document.querySelector<AuraRouter>('aura-router');
  if (!router) throw new Error('Hosted demo requires an <aura-router> element.');

  router.addEventListener(AURA_ROUTER_NAVIGATION_START, () => {
    navigationStartedAt = performance.now();
    document.documentElement.dataset.navigating = 'true';
    text('[data-last-navigation]', 'Preparing the next page…');
  });

  router.addEventListener(AURA_ROUTER_NAVIGATION, (event) => {
    const detail = (event as CustomEvent<{ to: string }>).detail;
    const duration = Math.max(0, performance.now() - navigationStartedAt);
    spaNavigations += 1;

    document.documentElement.dataset.navigating = 'false';
    syncActiveLinks(detail.to);
    syncDocumentTitle(detail.to);
    syncWorkspaceInstance();
    renderStatus(`${detail.to} · ${duration.toFixed(0)} ms · no reload`);
    focusPageHeading();
    announce(`Loaded ${document.title.replace(' — Aura Router', '')} without a full page reload`);
  });

  router.addEventListener(AURA_ROUTER_NAVIGATION_ERROR, (event) => {
    const detail = (event as CustomEvent<{ code?: string }>).detail;
    document.documentElement.dataset.navigating = 'false';
    const message = detail.code ? `Could not navigate (${detail.code})` : 'Could not navigate';
    text('[data-last-navigation]', message);
    announce(message);
  });

  document.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const copyButton = target?.closest<HTMLButtonElement>('[data-copy]');
    if (copyButton) handleCopy(copyButton);
  });

  AuraRouter.install();
  await waitForBootstrap(router);
  syncActiveLinks();
  syncDocumentTitle();
  syncWorkspaceInstance();
  renderStatus();
  document.documentElement.dataset.routerReady = 'true';
}

void boot().catch((error: unknown) => {
  console.error('[Aura demo] Bootstrap failed:', error);
  text('[data-last-navigation]', 'Router could not start');
});
