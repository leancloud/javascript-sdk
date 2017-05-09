'use strict';

describe('Conversation', () => {
  describe('.constructor', () => {
    const conv = new AV.Conversation('test', true, false);
    expect(conv.isTransient()).to.be(false);
    expect(conv.isSystem()).to.be(true);
    expect(conv.getName()).to.be('test');
  });
  describe('#save', () => {
    it('should create a realtime conversation', () => {
      const conv = new AV.Conversation('test');
      conv.addMember('test1');
      conv.addMember('test2');
      return conv.save();
    });
  });
});
