import Handlebars from 'handlebars';

type EventListType = {
  [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void;
};

type RefsType = Record<string, HTMLElement>;

export default abstract class Block<
  Props extends object = Record<string, unknown>,
  Refs extends object = RefsType
> {
  protected abstract template: string;

  protected props: Props;

  protected refs = {} as Refs;

  protected events: EventListType = {};

  private domElement: HTMLElement | null = null;

  constructor(props: Props = {} as Props) {
    this.props = props;
  }

  public element(): HTMLElement | null {
    if (!this.domElement) {
      this.render();
    }

    return this.domElement;
  }

  public setProps(nextProps: Partial<Props>): void {
    this.props = { ...this.props, ...nextProps } as Props;
    this.render();
  }

  protected componentDidMount(): void {}

  protected componentWillUnmount(): void {}

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
    const html = Handlebars.compile(this.template)(this.props);
    const templateElement = document.createElement('template');
    templateElement.innerHTML = html.trim();

    const fragment = templateElement.content;

    const refs = Array.from(fragment.querySelectorAll<HTMLElement>('[ref]')).reduce((list, element) => {
      const key = element.getAttribute('ref');
      if (key) {
        list[key] = element;
        element.removeAttribute('ref');
      }
      return list;
    }, {} as RefsType);

    this.refs = refs as Refs;

    return fragment.firstElementChild as HTMLElement | null;
  }

  private mountComponent(): void {
    this.attachListeners();
    this.componentDidMount();
  }

  private unmountComponent(): void {
    if (!this.domElement) {
      return;
    }

    this.componentWillUnmount();
    this.removeListeners();
  }

  private attachListeners(): void {
    if (!this.domElement) {
      return;
    }

    for (const eventName in this.events) {
      const eventCallback = this.events[eventName as keyof HTMLElementEventMap];
      if (typeof eventCallback === 'function') {
        this.domElement.addEventListener(eventName, eventCallback as EventListener);
      }
    }
  }

  private removeListeners(): void {
    if (!this.domElement) {
      return;
    }

    for (const eventName in this.events) {
      const eventCallback = this.events[eventName as keyof HTMLElementEventMap];
      if (typeof eventCallback === 'function') {
        this.domElement.removeEventListener(eventName, eventCallback as EventListener);
      }
    }
  }
}

export type { EventListType, RefsType };
