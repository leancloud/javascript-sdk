import { setupPolly } from './polly';
import { forceDeleteUser } from './util';

describe('Friendship', () => {
  setupPolly();

  before(async function createTestUser() {
    const targetUsername = 'friendship-target1';
    await forceDeleteUser(targetUsername);
    const sourceUsername = 'friendship-source1';
    await forceDeleteUser(sourceUsername);
    this.targetUser = await new AV.User.signUp(targetUsername, targetUsername);
    this.currentUser = await AV.User.signUp(sourceUsername, sourceUsername);
  });

  describe('.request', () => {
    it('shoud return void', async function() {
      const result = await AV.Friendship.request(this.targetUser.id);
      expect(result).to.equal(undefined);
    });
    it('requires objectId', function() {
      AV.Friendship.request().should.be.rejected();
    });
  });

  describe('query', () => {
    before(function() {
      return AV.Friendship.request(this.targetUser.id);
    });

    it('should get result', async function() {
      const requests = await AV.FriendshipRequest.getQuery(
        this.targetUser.id
      ).find({
        user: this.targetUser,
      });
      console.log(requests.map(r => r.toJSON()));
    });
  });
});
