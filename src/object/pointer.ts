export interface Pointer {
  __type: 'Pointer';
  className: string;
  objectId: string;
}

export function pointer({ className, objectId }: { className: string; objectId: string }): Pointer {
  return { __type: 'Pointer', className, objectId };
}
