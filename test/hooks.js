import { setupPolly } from './polly';

var IgnoreHookTest = AV.Object.extend('IgnoreHookTest');

describe('hooks', function() {
  setupPolly();

  it('Object#save (new object)', function() {
    var object = new IgnoreHookTest();
    object.set('title', 'test');
    return object.save().then(function() {
      return object.fetch(function(object) {
        expect(object.get('byBeforeSave')).to.be.ok();
        expect(object.get('byAfterSave')).to.be.ok();
      });
    });
  });

  it('Object#save (new object) disableBeforeHook', function() {
    var object = new IgnoreHookTest();
    object.set('title', 'test');
    object.disableBeforeHook();
    return object.save().then(function() {
      return object.fetch(function(object) {
        expect(object.get('byBeforeSave')).to.not.be.ok();
        expect(object.get('byAfterSave')).to.be.ok();
      });
    });
  });

  it('Object#save (new object) ignore afterSave', function() {
    var object = new IgnoreHookTest();
    object.set('title', 'test');
    object.ignoreHook('afterSave');
    return object.save().then(function() {
      return object.fetch(function(object) {
        expect(object.get('byBeforeSave')).to.be.ok();
        expect(object.get('byAfterSave')).to.not.be.ok();
      });
    });
  });

  it('Object#save (update object)', function() {
    var object = new IgnoreHookTest();
    object.set('title', 'test');
    return object.save().then(function() {
      object.set('title', 'something');
      return object.save().then(function() {
        return object.fetch(function(object) {
          expect(object.get('byBeforeSave')).to.be.ok();
          expect(object.get('byAfterSave')).to.be.ok();
          expect(object.get('byBeforeUpdate')).to.be.ok();
          expect(object.get('byAfterUpdate')).to.be.ok();
        });
      });
    });
  });

  it('Object#save (update object) disableAfterHook', function() {
    var object = new IgnoreHookTest();
    object.set('title', 'test');
    return object.save().then(function() {
      object.set('title', 'something');
      object.disableAfterHook();
      return object.save().then(function() {
        return object.fetch(function(object) {
          expect(object.get('byBeforeSave')).to.be.ok();
          expect(object.get('byAfterSave')).to.be.ok();
          expect(object.get('byBeforeUpdate')).to.be.ok();
          expect(object.get('byAfterUpdate')).to.not.be.ok();
        });
      });
    });
  });

  it('Object#save (modify children)', function() {
    var object = new IgnoreHookTest();
    var child1 = new IgnoreHookTest();
    var child2 = new IgnoreHookTest();
    child1.set('title', 'test');
    child1.disableBeforeHook();
    object.set('child1', child1);
    object.disableAfterHook();
    return object.save().then(function() {
      return object
        .fetch(function(object) {
          expect(object.get('byBeforeSave')).to.be.ok();
          expect(object.get('byAfterSave')).to.not.be.ok();
        })
        .then(function() {
          return child1.fetch(function(child1) {
            expect(child1.get('byBeforeSave')).to.not.be.ok();
            expect(child1.get('byAfterSave')).to.be.ok();
          });
        })
        .then(function() {
          child1.set('title', 'something');
          object.set('child1', child1);
          child2.set('title', 'test');
          child2.disableAfterHook();
          object.set('child2', child2);
          return object.save().then(function() {
            object.fetch(function(object) {
              expect(object.get('byBeforeUpdate')).to.be.ok();
              expect(object.get('byAfterUpdate')).to.not.be.ok();
            });
          });
        })
        .then(function() {
          child1.fetch().then(function(child1) {
            expect(child1.get('byBeforeUpdate')).to.not.be.ok();
            expect(child1.get('byAfterUpdate')).to.be.ok();
          });
        })
        .then(function() {
          child2.fetch().then(function(child2) {
            expect(child2.get('byBeforeSave')).to.be.ok();
            expect(child2.get('byAfterSave')).to.not.be.ok();
          });
        });
    });
  });

  it('Object.saveAll', function() {
    var object = new IgnoreHookTest();
    var objectIgnoreBefore = new IgnoreHookTest();
    var objectIgnoreAfter = new IgnoreHookTest();
    var newObject = new IgnoreHookTest();
    var newObjectIgnoreAll = new IgnoreHookTest();

    return Promise.all(
      [object, objectIgnoreBefore, objectIgnoreAfter].map(function(object) {
        object.set('title', 'test');
        return object.save();
      })
    ).then(function() {
      newObjectIgnoreAll.disableBeforeHook();
      newObjectIgnoreAll.disableAfterHook();

      objectIgnoreBefore.disableBeforeHook();
      objectIgnoreAfter.disableAfterHook();

      var objects = [
        object,
        objectIgnoreBefore,
        objectIgnoreAfter,
        newObject,
        newObjectIgnoreAll,
      ];

      objects.forEach(function(object) {
        object.set('title', 'something');
      });

      return AV.Object.saveAll(objects).then(function(objects) {
        return Promise.all(
          objects.map(function(object) {
            return object.fetch();
          })
        ).then(function() {
          expect(object.get('byBeforeSave')).to.be.ok();
          expect(object.get('byAfterSave')).to.be.ok();
          expect(object.get('byBeforeUpdate')).to.be.ok();
          expect(object.get('byAfterUpdate')).to.be.ok();

          expect(objectIgnoreBefore.get('byBeforeSave')).to.be.ok();
          expect(objectIgnoreBefore.get('byAfterSave')).to.be.ok();
          expect(objectIgnoreBefore.get('byBeforeUpdate')).to.not.be.ok();
          expect(objectIgnoreBefore.get('byAfterUpdate')).to.be.ok();

          expect(objectIgnoreAfter.get('byBeforeSave')).to.be.ok();
          expect(objectIgnoreAfter.get('byAfterSave')).to.be.ok();
          expect(objectIgnoreAfter.get('byBeforeUpdate')).to.be.ok();
          expect(objectIgnoreAfter.get('byAfterUpdate')).to.not.be.ok();

          expect(newObject.get('byBeforeSave')).to.be.ok();
          expect(newObject.get('byAfterSave')).to.be.ok();
          expect(newObject.get('byBeforeUpdate')).to.not.be.ok();
          expect(newObject.get('byAfterUpdate')).to.not.be.ok();

          expect(newObjectIgnoreAll.get('byBeforeSave')).to.not.be.ok();
          expect(newObjectIgnoreAll.get('byAfterSave')).to.not.be.ok();
          expect(newObjectIgnoreAll.get('byBeforeUpdate')).to.not.be.ok();
          expect(newObjectIgnoreAll.get('byAfterUpdate')).to.not.be.ok();
        });
      });
    });
  });

  it('Object#destroy', function() {
    var object = new IgnoreHookTest();
    object.set('title', 'test');
    return object.save().then(function() {
      object.set('title', 'something');
      object.disableBeforeHook();
      return object.destroy();
    });
  });

  it('Object#destroyAll', function() {
    var object = new IgnoreHookTest();
    var objectIgnoreBefore = new IgnoreHookTest();
    objectIgnoreBefore.disableBeforeHook();

    return Promise.all(
      [object, objectIgnoreBefore].map(function(object) {
        return object.save();
      })
    )
      .then(function() {
        return AV.Object.destroyAll([objectIgnoreBefore, object]);
      })
      .should.be.rejectedWith(/Error from beforeDelete/);
  });
});
