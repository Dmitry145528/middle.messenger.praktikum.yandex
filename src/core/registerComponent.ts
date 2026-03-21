import Handlebars from 'handlebars';
import type { HelperOptions } from 'handlebars';
import type Block from './Block';

type BlockConstructor = new (props?: object) => Block & { element(): HTMLElement | null };

let uniqueId = 0;

export function registerComponent(Component: BlockConstructor & { componentName: string }): void {
  Handlebars.registerHelper(Component.componentName, function (this: unknown, { hash, data }: HelperOptions) {
    const id = ++uniqueId;
    const dataAttribute = `data-component-hbs-id="${id}"`;
    const selector = `[data-component-hbs-id="${id}"]`;
    const component = new Component(hash as Record<string, unknown>);

    const root = (data.root ??= {}) as Record<string, unknown>;
    const refs = (root.__refs ??= {}) as Record<string, HTMLElement>;
    const children = (root.__children ??= []) as Array<{
      component: Block;
      embed(node: DocumentFragment): void;
    }>;

    if ('ref' in hash && hash.ref) {
      const el = component.element();
      if (el) {
        refs[hash.ref as string] = el as HTMLElement;
      }
    }

    children.push({
      component,
      embed(node: DocumentFragment) {
        const placeholder = node.querySelector(selector);
        if (!placeholder) {
          throw new Error(`Не найден placeholder с data-id для компонента ${Component.componentName}`);
        }
        const element = component.element();
        if (!element) {
          throw new Error('Элемент компонента не создан');
        }
        placeholder.replaceWith(element);
      }
    });

    return `<div ${dataAttribute}></div>`;
  });
}
