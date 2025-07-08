declare module 'joi-tz' {
  import { ExtensionFactory } from 'joi';

  const JoiTimezone: ExtensionFactory;

  export = JoiTimezone;
}
