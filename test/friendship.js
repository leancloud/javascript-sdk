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
    it('requires target user ID', function() {
      AV.Friendship.request().should.be.rejected();
    });
  });

  describe('query', () => {
    before(function() {
      return AV.Friendship.request(this.targetUser.id, {
        attributes: {
          group: 'closed',
        },
      });
    });

    it('should get result', async function() {
      const requests = await AV.FriendshipRequest.getFriendQuery(
        this.targetUser.id
      ).find({
        user: this.targetUser,
      });
      requests.should.be.length(1);
      requests[0]
        .get('status')
        .should.be.eql(AV.FriendshipRequestStatus.PENDING);
    });
  });
});
