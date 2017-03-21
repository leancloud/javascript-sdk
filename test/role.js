'use strict';

describe("Role", function() {
  describe("constructor", function() {
    it("normal usage", function() {
      var acl = new AV.ACL();
      var role = new AV.Role('foo', acl);
      expect(role.getName()).to.be('foo');
      expect(role.getACL()).to.be(acl);
    });
    it("acl is optional", function() {
      var role = new AV.Role('foo');
      expect(role.getName()).to.be('foo');
      expect(role.getACL().toJSON()).to.eql({
        '*': {
          read: true
        }
      });
    });
    it('no default ACL', () => {
      expect(AV.Object.createWithoutData('_Role').getACL()).to.eql(undefined);
      expect(AV._decode({
        __type: 'Pointer',
        className: '_Role',
        name: 'Admin',
        objectId: '577e50c3165abd005549f210',
      }).getACL()).to.eql(undefined);
      expect((new AV.Object('_Role')).getACL()).not.to.eql(undefined);
    });
    it("type check", function() {
      expect(function() {
        new AV.Role('foo', {});
      }).to.throwError();
    });
    it('no argument', function() {
      expect(function() {
        new AV.Role();
      }).not.to.throwError();
    });
  });
});
