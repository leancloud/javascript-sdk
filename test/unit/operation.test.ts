import 'should';
import { Operation } from '../../src/operation';
import { LCObjectRef, LCObject } from '../../src/object';

describe('Operation', function () {
  it('.unset', function () {
    Operation.unset().should.eql({
      __op: 'Delete',
    });
  });

  it('.increment', function () {
    Operation.increment(123).should.eql({
      __op: 'Increment',
      amount: 123,
    });
  });

  it('.decrement', function () {
    Operation.decrement(123).should.eql({
      __op: 'Decrement',
      amount: 123,
    });
  });

  it('.add', function () {
    const op = { __op: 'Add', objects: ['item'] };
    Operation.add('item').should.eql(op);
    Operation.add(['item']).should.eql(op);
  });

  it('.addUnique', function () {
    const op = { __op: 'AddUnique', objects: ['item'] };
    Operation.addUnique('item').should.eql(op);
    Operation.addUnique(['item']).should.eql(op);
  });

  it('.remove', function () {
    const op = { __op: 'Remove', objects: ['item'] };
    Operation.remove('item').should.eql(op);
    Operation.remove(['item']).should.eql(op);
  });

  it('.bitAnd', function () {
    Operation.bitAnd(0x123).should.eql({
      __op: 'BitAnd',
      value: 0x123,
    });
  });

  it('.bitOr', function () {
    Operation.bitOr(0x123).should.eql({
      __op: 'BitOr',
      value: 0x123,
    });
  });

  it('.bitXor', function () {
    Operation.bitXor(0x123).should.eql({
      __op: 'BitXor',
      value: 0x123,
    });
  });

  it('.addRelation', function () {
    const ref = new LCObjectRef(null, 'Test', 'test-object-id');
    const obj = new LCObject(null, 'Test', 'test-object-id');
    const op = {
      __op: 'AddRelation',
      objects: [{ __type: 'Pointer', className: 'Test', objectId: 'test-object-id' }],
    };
    Operation.addRelation(ref).should.eql(op);
    Operation.addRelation(obj).should.eql(op);
    Operation.addRelation([ref]).should.eql(op);
    Operation.addRelation([obj]).should.eql(op);
  });

  it('.removeRelation', function () {
    const ref = new LCObjectRef(null, 'Test', 'test-object-id');
    const obj = new LCObject(null, 'Test', 'test-object-id');
    const op = {
      __op: 'RemoveRelation',
      objects: [{ __type: 'Pointer', className: 'Test', objectId: 'test-object-id' }],
    };
    Operation.removeRelation(ref).should.eql(op);
    Operation.removeRelation(obj).should.eql(op);
    Operation.removeRelation([ref]).should.eql(op);
    Operation.removeRelation([obj]).should.eql(op);
  });
});
