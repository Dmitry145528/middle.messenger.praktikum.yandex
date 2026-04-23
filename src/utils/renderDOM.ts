export type MountableBlock = {
  element(): HTMLElement | null;
  detach(): void;
};

export function renderDOM(rootQuery: string, block: MountableBlock): void {
  const root = document.querySelector(rootQuery);
  if (!root) {
    throw new Error(`Элемент не найден: ${rootQuery}`);
  }
  root.replaceChildren();
  const el = block.element();
  if (!el) {
    throw new Error('Блок не сформировал DOM');
  }
  root.appendChild(el);
}
