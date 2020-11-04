import 'should';
import { op } from '../../../src';

describe('Operation', () => {
  it('unset', () => {
    op.unset().should.eql({ __op: 'Delete' });
  });

  it('increment', () => {
    op.increment(123).should.eql({ __op: 'Increment', amount: 123 });
  });

  it('decrement', () => {
    op.decrement(123).should.eql({ __op: 'Decrement', amount: 123 });
  });

  it('add', () => {
    op.add('item').should.eql({ __op: 'Add', objects: ['item'] });
    op.add(['item']).should.eql({ __op: 'Add', objects: ['item'] });
  });

  it('addUnique', () => {
    op.addUnique('item').should.eql({ __op: 'AddUnique', objects: ['item'] });
    op.addUnique(['item']).should.eql({ __op: 'AddUnique', objects: ['item'] });
  });

  it('remove', () => {
    op.remove('item').should.eql({ __op: 'Remove', objects: ['item'] });
    op.remove(['item']).should.eql({ __op: 'Remove', objects: ['item'] });
  });

  it('bitAnd', () => {
    op.bitAnd(0x123).should.eql({ __op: 'BitAnd', value: 0x123 });
  });

  it('bitOr', () => {
    op.bitOr(0x123).should.eql({ __op: 'BitOr', value: 0x123 });
  });

  it('bitXor', () => {
    op.bitXor(0x123).should.eql({ __op: 'BitXor', value: 0x123 });
  });

  it('addRelation', () => {
    op.addRelation({ className: 'Test', objectId: 'test-id' }).should.eql({
      __op: 'AddRelation',
      objects: [{ __type: 'Pointer', className: 'Test', objectId: 'test-id' }],
    });
    op.addRelation([{ className: 'Test', objectId: 'test-id' }]).should.eql({
      __op: 'AddRelation',
      objects: [{ __type: 'Pointer', className: 'Test', objectId: 'test-id' }],
    });
  });

  it('removeRelation', () => {
    op.removeRelation({ className: 'Test', objectId: 'test-id' }).should.eql({
      __op: 'RemoveRelation',
      objects: [{ __type: 'Pointer', className: 'Test', objectId: 'test-id' }],
    });
    op.removeRelation([{ className: 'Test', objectId: 'test-id' }]).should.eql({
      __op: 'RemoveRelation',
      objects: [{ __type: 'Pointer', className: 'Test', objectId: 'test-id' }],
    });
  });
});
