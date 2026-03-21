import { registerComponent } from '../core';
import Button from './button';
import Input from './input';
import Link from './link';
import Avatar from './avatar/avatar.hbs?raw';
import ProfileField from './profile-field/profile-field.hbs?raw';

registerComponent(Button);
registerComponent(Input);
registerComponent(Link);

export const Partials = {
  Avatar,
  ProfileField
};
