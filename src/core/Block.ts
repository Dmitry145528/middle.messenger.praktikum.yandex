import Handlebars from 'handlebars';

export interface BlockChild {
  component: Block<BlockOwnProps>;
  embed(node: DocumentFragment): void;
}

export interface BlockOwnProps {
  __children?: BlockChild[];
  __refs?: Record<string, HTMLElement>;
}

export type EventListType = Partial<Record<keyof HTMLElementEventMap, (e: Event) => void>>;

export default abstract class Block<Props extends object = Record<string, unknown>> {
  protected abstract template: string;

  protected props: Props;

  private domElement: HTMLElement | null = null;

  protected children: Block<object>[] = [];

  protected refs: Record<string, HTMLElement> = {};

  protected events: EventListType = {};

  constructor(props: Props = {} as Props) {
    this.props = props;
  }

  public element(): HTMLElement | null {
    if (!this.domElement) {
      this.render();
    }
    return this.domElement;
  }

  public setProps(props: Partial<Props>): void {
    this.props = { ...this.props, ...props, __children: [], __refs: {} } as Props;
    this.render();
  }

  protected componentDidMount(): void {}

  private mountComponent(): void {
    this.attachListeners();
    this.componentDidMount();
  }

  protected componentWillUnmount(): void {}

  protected unmountComponent(): void {
    if (this.domElement) {
      this.children.reverse().forEach((child) => child.unmountComponent());
      this.componentWillUnmount();
      this.removeListeners();
    }
  }

  public detach(): void {
    this.unmountComponent();
    if (this.domElement?.parentNode) {
      this.domElement.remove();
    }
    this.domElement = null;
  }

  private attachListeners(): void {
    for (const eventName in this.events) {
      const eventCallback = this.events[eventName as keyof HTMLElementEventMap];
      if (typeof eventCallback === 'function' && this.domElement) {
        this.domElement.addEventListener(eventName, eventCallback);
      }
    }
  }

  private removeListeners(): void {
    for (const eventName in this.events) {
      const eventCallback = this.events[eventName as keyof HTMLElementEventMap];
      if (typeof eventCallback === 'function' && this.domElement) {
        this.domElement.removeEventListener(eventName, eventCallback);
      }
    }
  }

  protected render(): void {
    this.unmountComponent();
    const fragment = this.compile();
    if (this.domElement && fragment) {
      this.domElement.replaceWith(fragment);
    }
    this.domElement = fragment;
    this.mountComponent();
  }

  private compile(): HTMLElement | null {
    const context = { ...this.props, __children: [], __refs: {} } as Props & BlockOwnProps & Record<string, unknown>;
    const html = Handlebars.compile(this.template)(context, { data: { root: context } });
    const templateElement = document.createElement('template');
    templateElement.innerHTML = html.trim();
    const fragment = templateElement.content;

    if (context.__children) {
      this.children = context.__children.map((child) => child.component) as Block<object>[];
      context.__children.forEach((child) => {
        child.embed(fragment);
      });
    }

    const defaultRefs = context.__refs ?? {};
    this.refs = Array.from(fragment.querySelectorAll<HTMLElement>('[ref]')).reduce(
      (list, element) => {
        const key = element.getAttribute('ref');
        if (key) {
          list[key] = element;
          element.removeAttribute('ref');
        }
        return list;
      },
      { ...defaultRefs } as Record<string, HTMLElement>
    );

    return fragment.firstElementChild as HTMLElement | null;
  }
}
