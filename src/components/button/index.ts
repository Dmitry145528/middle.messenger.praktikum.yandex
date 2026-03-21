import Block from '../../core/Block';
import template from './button.hbs?raw';

interface ButtonProps {
  text?: string;
  type?: string;
  htmlType?: string;
}

export default class Button extends Block<ButtonProps & { ref?: string }> {
  static componentName = 'Button';

  protected template = template;
}
