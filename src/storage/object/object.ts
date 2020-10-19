// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface LCObjectData extends Record<string, any> {
  ACL?: Record<string, { read?: boolean; write?: boolean }>;
}

function createObject(props: { className: string; data: LCObjectData }) {
  //
}
