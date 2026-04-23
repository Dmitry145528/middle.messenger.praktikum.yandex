import { isEqual } from '../utils/isEqual';
import { renderDOM, type MountableBlock } from '../utils/renderDOM';

export type BlockFactory = () => MountableBlock;

type RouteProps = {
  rootQuery: string;
};

export default class Route {
  private readonly _pathname: string;

  private readonly _factory: BlockFactory;

  private readonly _props: RouteProps;

  private _block: MountableBlock | null = null;

  constructor(pathname: string, factory: BlockFactory, props: RouteProps) {
    this._pathname = pathname;
    this._factory = factory;
    this._props = props;
  }

  leave(): void {
    if (this._block) {
      this._block.detach();
      this._block = null;
    }
  }

  match(pathname: string): boolean {
    return isEqual(pathname, this._pathname);
  }

  render(): void {
    this._block = this._factory();
    renderDOM(this._props.rootQuery, this._block);
  }
}
