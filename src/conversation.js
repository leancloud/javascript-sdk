'use strict';

const AV = require('./av');

/**
 * @class
 *
 * <p>An AV.Conversation is a local representation of a LeanCloud realtime's
 * conversation. Tshi class is a subclass of an AV.Object, and retains the
 * same functionality of an AV.Object, but also extends it with various
 * conversation specific methods, like get members, creators of this conversation.
 * </p>
 */
module.exports = AV.Object.extend('_Conversation', {
  constructor: function(name, isSystem, isTransient) {
    AV.Object.prototype.constructor.call(this, null, null);
    this.set('name', name);
    this.set('sys', isSystem ? true : false);
    this.set('tr', isTransient ? true : false);
  },
  /**
   * Get current conversation's creator.
   *
   * @return {String}
   */
  getCreator: function() {
    return this.get('c');
  },

  /**
   * Get the last message's time.
   *
   * @return {Date}
   */
  getLastMessageAt: function() {
    return this.get('lm');
  },

  /**
   * Get this conversation's members
   *
   * @return {Array}
   */
  getMembers: function() {
    return this.get('m');
  },

  /**
   * Add a member to this conversation
   *
   * @param {String} member
   */
  addMember: function(member) {
    this.add('m', member);
  },

  /**
   * Get this conversation's members who set this conversation as muted.
   *
   * @return {Boolean}
   */
  getMutedMembers: function() {
    return this.get('mu');
  },

  /**
   * Get this conversation's name field.
   *
   * @return String
   */
  getName: function() {
    return this.get('name');
  },

  /**
   * Returns true if this conversation is transient conversation.
   *
   * @return {Boolean}
   */
  isTransient: function() {
    return this.get('tr');
  },

  /**
   * Returns true if this conversation is system conversation.
   *
   * @return {Boolean}
   */
  isSystem: function() {
    return this.get('sys');
  },

  send: function() {

  },
});
