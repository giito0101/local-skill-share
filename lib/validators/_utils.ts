export type FieldErrors = Record<string, string[] | undefined>;

export function getFirstError(errors: FieldErrors | undefined, name: string) {
  return errors?.[name]?.[0];
}
