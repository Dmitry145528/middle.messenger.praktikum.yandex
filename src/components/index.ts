import { registerComponent } from '../core';
import Button from './button';
import Input from './input';
import Link from './link';
import Avatar from './avatar/avatar.hbs?raw';
import ProfileField from './profile-field/profile-field.hbs?raw';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Handlebars hash is dynamic
registerComponent(Button as any);
registerComponent(Input as any);
registerComponent(Link as any);

export const Partials = {
  Avatar,
  ProfileField
};
