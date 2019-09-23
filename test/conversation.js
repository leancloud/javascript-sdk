'use strict';

import { setupPolly } from './polly';

describe('Conversation', () => {
  setupPolly();

  describe('.constructor', () => {
    const conv = new AV.Conversation('test', {
      isSystem: true,
      isTransient: false,
    });
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
  describe('#send', () => {
    it('should send a realtime message to the conversation', () => {
      const conv = new AV.Conversation('test');
      conv.addMember('test1');
      conv.addMember('test2');
      return conv.save().then(() => {
        return conv.send(
          'admin',
          'test test test!',
          {},
          { useMasterKey: true }
        );
      });
    });

    it('should send a realtime message to the system conversation', () => {
      const conv = new AV.Conversation('system', { isSystem: true });
      return conv.save().then(() => {
        return conv.send(
          'admin',
          'test system conversation !',
          {
            toClients: ['user1', 'user2'],
          },
          {
            useMasterKey: true,
          }
        );
      });
    });
  });
  describe('#broadcast', () => {
    it('should broadcast a message to all clients with current conversation', () => {
      const conv = new AV.Conversation('test', { isSystem: true });
      return conv.save().then(() => {
        const authOptions = {
          useMasterKey: true,
        };
        return conv.broadcast('admin', 'test broadcast!', {}, authOptions);
      });
    });
  });
});
