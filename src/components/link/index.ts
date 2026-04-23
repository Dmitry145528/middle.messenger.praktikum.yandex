import Block from '../../core/Block';
import template from './link.hbs?raw';

interface LinkProps {
  text?: string;
  href?: string;
  className?: string;
}

export default class Link extends Block<LinkProps> {
  static componentName = 'Link';

  protected template = template;
}
