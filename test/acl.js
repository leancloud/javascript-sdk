'use strict';

import { setupPolly } from './polly';

var GameScore = AV.Object.extend('GameScore');
describe('ObjectACL', function() {
  setupPolly();

  it('set and fetch acl', function() {
    var gameScore = new GameScore();
    gameScore.set('score', 2);
    gameScore.set('playerName', 'sdf');
    gameScore.set('cheatMode', false);

    var postACL = new AV.ACL();
    postACL.setPublicReadAccess(true);
    postACL.setPublicWriteAccess(true);

    postACL.setReadAccess('read-only', true);
    postACL.setWriteAccess('write-only', true);
    postACL.setRoleWriteAccess('write-only-role', true);
    gameScore.setACL(postACL);
    return gameScore
      .save()
      .then(result => {
        result.id.should.be.ok();
        return AV.Object.createWithoutData('GameScore', result.id).fetch({
          includeACL: true,
        });
      })
      .then(fetchedGameScore => {
        const acl = fetchedGameScore.getACL();
        acl.should.be.instanceOf(AV.ACL);
        acl.getPublicReadAccess().should.eql(true);
        acl.getPublicWriteAccess().should.eql(true);
        acl.getReadAccess('read-only').should.eql(true);
        acl.getWriteAccess('read-only').should.eql(false);
        acl.getReadAccess('write-only').should.eql(false);
        acl.getWriteAccess('write-only').should.eql(true);
        acl.getRoleReadAccess('write-only-role').should.eql(false);
        acl.getRoleWriteAccess('write-only-role').should.eql(true);
      })
      .then(
        () => gameScore.destroy(),
        error => {
          gameScore.destroy();
          throw error;
        }
      );
  });
});
