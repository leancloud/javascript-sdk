describe('promise', function() {
  describe('constructor', function(){
    it('shoud be resolve with 42.', function(done) {
      var promise = new AV.Promise(function(resolve) {
        resolve(42);
      });
      promise.then(function(ret) {
        expect(ret).to.be(42);
        done();
      });
    });
  });

  describe('catch', function(){
    it('shoud catch exception.', function(done) {
      var promise = new AV.Promise(function(resolve) {
        throw 'test error';
      });
      promise.catch(function(error) {
        expect(error).to.be('test error');
        done();
      });
    });
  });


  describe('AV.Promise._debugError', function() {
    AV.Promise._isPromisesAPlusCompliant = true;
    it('should log error', function(done) {
      AV.Promise.setDebugError(true);
      var p = new AV.Promise();
      p.then(function() {
        noThisMethod();
      });
      p.resolve(100);
      p.finally(function(){
         AV.Promise.setDebugError(false);
         AV.Promise._isPromisesAPlusCompliant = false;
        done();
      });
    });
  });

  describe('always and finally', function(){
    it('should call always and finally', function(done){
      var p = new AV.Promise(function(resolve, reject) {
        resolve(42);
      });
      var counts= 0;
      var completefn = function() {
        if(counts == 2) done();
      };
      p.finally(function(ret) {
        expect(ret).to.be(42);
        counts++;
        completefn();
      });
      p.always(function(ret) {
        expect(ret).to.be(42);
        counts++;
        completefn();
      });
    });

    it('should call always and finally when reject.', function(done){
      var p = new AV.Promise(function(resolve, reject) {
        reject(42);
      });
      var counts= 0;
      var completefn = function() {
        if(counts == 2) done();
      };
      p.finally(function(ret) {
        expect(ret).to.be(42);
        counts++;
        completefn();
      });
      p.always(function(ret) {
        expect(ret).to.be(42);
        counts++;
        completefn();
      });
    });
  });

  describe('AV.Promise#catch', function(){
    it('sould be called', function(done) {
      var promise = new AV.Promise(function(resolve, reject) {
        reject(42);
      });
      promise.then(function(ret) {
        throw "should not be called";
      }).catch(function(err) {
        expect(err).to.be(42);
        done();
      });
    });
    it('sould not be called', function(done) {
      var promise = new AV.Promise(function(resolve, reject) {
        resolve(42);
        reject(42);
      });
      promise.then(function(ret) {
        expect(ret).to.be(42);
        done();
      }).catch(function(err) {
        throw "should not be called";
      });
    });
  });

  function timerPromisefy(delay) {
    return new AV.Promise(function (resolve) {
      setTimeout(function () {
        resolve(delay);
      }, delay);
     });
  };

  function timerPromisefyReject(delay) {
    return new AV.Promise(function (resolve, reject) {
      setTimeout(function () {
        reject(delay);
      }, delay);
     });
  };


  describe('AV.Promise.all and AV.Promise.when', function() {
   it('AV.Promise.all is resolved with array', function(done){
     var startDate = Date.now();

     AV.Promise.all([
       timerPromisefy(1),
       timerPromisefy(32),
       timerPromisefy(64),
       timerPromisefy(128)
     ]).then(function (values) {
        //should be 128 ms
        expect(Date.now() - startDate).to.be.within(125,135);
        expect(values).to.be.an('array');
        expect(values[0]).to.be(1);
        expect(values[1]).to.be(32);
        expect(values[2]).to.be(64);
        expect(values[3]).to.be(128);
        done();
     });
   });
   it('AV.Promise.when is resolved with arguments', function(done){
     var startDate = Date.now();

     AV.Promise.when([
       timerPromisefy(1),
       timerPromisefy(32),
       timerPromisefy(64),
       timerPromisefy(128)
     ]).then(function (r1, r2, r3, r4) {
        //should be 128 ms
        expect(Date.now() - startDate).to.be.within(125,135);
        expect(r1).to.be(1);
        expect(r2).to.be(32);
        expect(r3).to.be(64);
        expect(r4).to.be(128);
        done();
     });
   });

   it('AV.Promise.when is rejected with errors', function(done){
     var startDate = Date.now();

     AV.Promise.when(
       timerPromisefyReject(1),
       timerPromisefyReject(32),
       timerPromisefyReject(64),
       timerPromisefyReject(128)
     ).catch(function (errors) {
        expect(errors.length).to.be(4);
        expect(errors[0]).to.be(1);
        expect(errors[1]).to.be(32);
        expect(errors[2]).to.be(64);
        expect(errors[3]).to.be(128);
        //should be 128 ms
        expect(Date.now() - startDate).to.be.within(125, 145);

        done();
     }).done(function(ret){
        throw ret;
     });
   });

   it('AV.Promise.all is rejected with only one error', function(done){
     var startDate = Date.now();

     AV.Promise.all([
       timerPromisefyReject(1),
       timerPromisefyReject(32),
       timerPromisefyReject(64),
       timerPromisefyReject(128)
     ]).catch(function (error) {
        expect(error).to.be(1);
        //should be 1 ms
        expect(Date.now() - startDate).to.be.within(0, 10);
        AV.Promise._isPromisesAPlusCompliant = false;
        setTimeout(done, 500);
     }).done(function(ret){
        throw ret;
     });
   });

  });

  describe('PromiseAPlusCompliant', function() {
    it('should catch all them.', function(done) {
      AV.Promise._isPromisesAPlusCompliant = true;
      new AV.Promise(function(resolve, reject) {
        return resolve(123);
      })
      .then(function() {
        throw {code: 1};
      })
      .then(function(){}, function(error) {
        expect(error.code).to.be(1);
        AV.Promise._isPromisesAPlusCompliant = false;
        done();
      })
    });

    it('shoud work in order', function(done) {
      AV.Promise._isPromisesAPlusCompliant = true;

      this.timeout(10000);
      var ret = [];
      var a = new AV.Promise(function(resolve){
        setTimeout(function(){
          resolve('hello');
        }, 200);
      });

      var test = function(){
        ret.push('before');
        a.then(function(val){
          ret.push(val);
        });
        ret.push('after');
      }

      test();
      setTimeout(function() {
        expect(ret).to.have.length(3);
        expect(ret[0]).to.be('before');
        expect(ret[1]).to.be('after');
        expect(ret[2]).to.be('hello');
        //run test in setTimeout
        ret = [];
        setTimeout(function(){
          test();
          setTimeout(function() {
            expect(ret).to.have.length(3);
            expect(ret[0]).to.be('before');
            expect(ret[1]).to.be('after');
            expect(ret[2]).to.be('hello');
            done();
         }, 300);
        }, 500);
        AV.Promise._isPromisesAPlusCompliant = false;
        done();
      }, 300);

    });
  });

  describe('AV.Promise.race', function(){
    AV.Promise._isPromisesAPlusCompliant = true;
    it('should be called once.', function(done) {
      var wasCalled = false;
      AV.Promise.race([
        timerPromisefy(1),
        timerPromisefy(32),
        timerPromisefy(64),
        timerPromisefy(128)
      ]).then(function (value) {
        if (wasCalled) throw 'error';
        wasCalled = true;
        expect(value).to.be(1);
        AV.Promise._isPromisesAPlusCompliant = false;
        done();
      });
    });
    it('should run all promises.', function(done) {
      AV.Promise._isPromisesAPlusCompliant = true;
      var results = [];
      var timerPromisefy2 = function(delay) {
        return new AV.Promise(function (resolve, reject) {
          setTimeout(function () {
            results.push(delay);
            resolve(delay);
          }, delay);
        });
      };

      var wasCalled = false;
      AV.Promise.race([
        timerPromisefy2(1),
        timerPromisefy2(32),
        timerPromisefy2(64),
        timerPromisefy2(128)
      ]).then(function (value) {
        if (wasCalled) throw 'error';
        wasCalled = true;
        expect(value).to.be(1);
      }).catch(function(error) {
        throw error;
      });
      setTimeout(function() {
        expect(wasCalled).to.be(true);
        expect(results.length).to.be(4);
        expect(results[0]).to.be(1);
        expect(results[1]).to.be(32);
        expect(results[2]).to.be(64);
        expect(results[3]).to.be(128);
        AV.Promise._isPromisesAPlusCompliant = false;
        done();
      }, 500);
    });

  });
});
