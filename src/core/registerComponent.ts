import Handlebars from 'handlebars';
import type { HelperOptions } from 'handlebars';
import type Block from './Block';

type BlockConstructor = new (props?: object) => Block<object> & { element(): HTMLElement | null };

export type ComponentConstructor = BlockConstructor & { componentName: string };

let uniqueId = 0;

export function registerComponent(Component: ComponentConstructor): void {
  Handlebars.registerHelper(Component.componentName, function (this: unknown, { hash, data }: HelperOptions) {
    const id = ++uniqueId;
    const dataAttribute = `data-component-hbs-id="${id}"`;
    const selector = `[data-component-hbs-id="${id}"]`;
    const component = new Component(hash as Record<string, unknown>);

    const dataRoot = data as { root?: Record<string, unknown> };
    const root = (dataRoot.root ??= {});
    const refs = (root.__refs ??= {}) as Record<string, HTMLElement>;
    const children = (root.__children ??= []) as Array<{
      component: Block<object>;
      embed(node: DocumentFragment): void;
    }>;

    const hashObj = hash as Record<string, unknown>;
    if (hashObj.ref) {
      const el = component.element();
      if (el) {
        refs[hashObj.ref as string] = el;
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
