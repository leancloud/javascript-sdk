'use strict';

import { setupPolly } from './polly';

describe('Role', function() {
  setupPolly();
  describe('constructor', function() {
    it('normal usage', function() {
      var acl = new AV.ACL();
      var role = new AV.Role('foo', acl);
      expect(role.getName()).to.be('foo');
      expect(role.getACL()).to.be(acl);
    });
    it('acl is required', function() {
      var role = new AV.Role('foo');
      return role.save().should.be.rejected();
    });
    it('type check', function() {
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
