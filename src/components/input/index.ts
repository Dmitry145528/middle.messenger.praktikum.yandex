import Block from '../../core/Block';
import template from './input.hbs?raw';
import { validateField } from '../../utils/validation';

interface InputProps {
  label?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  error?: string;
  value?: string;
}

export default class Input extends Block<InputProps & { ref?: string }> {
  static componentName = 'Input';

  protected template = template;

  private handleBlur = (): void => {
    const input = this.refs.field as HTMLInputElement | undefined;
    const name = this.props.name;
    if (!input || !name) return;

    const value = input.value;
    const error = validateField(name, value);
    this.setProps({ error: error ?? undefined, value });
  };

  protected componentDidMount(): void {
    const input = this.refs.field as HTMLInputElement | undefined;
    input?.addEventListener('blur', this.handleBlur);
  }

  protected componentWillUnmount(): void {
    const input = this.refs.field as HTMLInputElement | undefined;
    input?.removeEventListener('blur', this.handleBlur);
  }
}
