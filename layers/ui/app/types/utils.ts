export type DynamicSlotsKeys<Name extends string | undefined, Suffix extends string | undefined = undefined> = (
  Name extends string
    ? Suffix extends string
      ? Name | `${Name}-${Suffix}`
      : Name
    : never
)
export type DynamicSlots<
  T extends { slot?: string },
  Suffix extends string | undefined = undefined,
  ExtraProps extends object = object,
> = {
  [K in DynamicSlotsKeys<T['slot'], Suffix>]: (
    props: { item: Extract<T, { slot: K extends `${infer Base}-${Suffix}` ? Base : K }> } & ExtraProps,
  ) => any
}

export type NestedItem<T> = T extends Array<infer I> ? NestedItem<I> : T

type DotPathKeys<T> = T extends Array<any>
  ? never
  : T extends object
    ? {
        [K in keyof T & string]:
        T[K] extends Record<string, any>
          ? K | `${K}.${DotPathKeys<T[K]>}`
          : K
      }[keyof T & string]
    : never

export type GetItemKeys<I> = keyof Extract<NestedItem<I>, object> | DotPathKeys<Extract<NestedItem<I>, object>>
