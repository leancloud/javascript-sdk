
describe("files", function() {
  describe("#Saving base64", function(){
    this.timeout(10000);
    it("should be saved", function(done){
      var base64 = "d29ya2luZyBhdCBhdm9zY2xvdWQgaXMgZ3JlYXQh";
      var file = new AV.File("myfile.txt", { base64: base64 });
      file.metaData('format', 'txt file');
      file.setACL(new AV.ACL());
      file.save().then(function(){
        // console.log(file.url());
        // console.log(file.id);
        expect(file.ownerId()).to.be.ok();
        expect(file.id).to.be.ok();
        expect(file.metaData('format')).to.be('txt file');
        file.destroy().then(function(){
          done();
        }, function(error){
          done(error);
        });
      }, function(error){
        done(error);
      });
    });
  });

  describe("#Test withURL", function(){
    this.timeout(10000);
    it("should be saved", function(done){
      var url = "http://i1.wp.com/blog.avoscloud.com/wp-content/uploads/2014/05/screen568x568-1.jpg?resize=202%2C360";
      var file = AV.File.withURL('screen.jpg', url);
      file.save().then(function(){
        // console.log(file.url());
        // console.log(file.id);
        expect(file.ownerId()).to.be.ok();
        expect(file.id).to.be.ok();
        expect(file.metaData('__source')).to.be('external');
        done();
      }, function(error){
        done(error);
      });
    });
  });

  describe("#Saving buffer in node.js", function(){
    it("should be saved", function(done){
      if(AV._isNode){
        var file = new AV.File('myfile.txt', new Buffer('hello world'));
        file.save().then(function(){
          // console.log("saved buffer...");
          // console.log(file.url());
          // console.log(file.id);
          // console.log(file.metaData());
          expect(file.size()).to.be(11);
          expect(file.ownerId()).to.be.ok();
          expect(file.id).to.be.ok();
          // console.log(file.thumbnailURL(200, 100));
          expect(file.thumbnailURL(200, 100)).to.be(file.url() + "?imageView/2/w/200/h/100/q/100/format/png");
          file.destroy().then(function(){
            done();
          }, function(error){
            done(error);
          });
        }, function(error){
          done(error);
        });
      }else{
        done();
      }
    });
  });
  describe("#Saving array", function(){
    it("should be saved", function(done){
      var bytes = [ 0xBE, 0xEF, 0xCA, 0xFE ];
      var file = new AV.File("myfile.txt", bytes);
      file.save().then(function(){
        // console.log(file.url());
        // console.log(file.id);
        // console.log(file.metaData());
        expect(file.size()).to.be(4);
        expect(file.ownerId()).to.be.ok();
        expect(file.id).to.be.ok();
        file.destroy().then(function(){
          done();
        }, function(error){
          done(error);
        });
      }, function(error){
        done(error);
      });
    });
  });
  describe("#Saving file with object", function(){
    it("should be saved", function(done){
      var bytes = [ 0xBE, 0xEF, 0xCA, 0xFE ];
      var file = new AV.File("myfile.txt", bytes);
      file.save().then(function(){
        // console.log(file.url());
        // console.log(file.id);
        var jobApplication = new AV.Object("JobApplication");
        jobApplication.set("applicantName", "Joe Smith");
        jobApplication.set("applicantResumeFile", file);
        jobApplication.save().then(function(result){
          expect(result.id).to.be.ok();
          var query = new AV.Query("JobApplication");
          query.get(result.id, {
            success: function(ja) {
              expect(ja.id).to.be.ok();
              var arf = ja.get("applicantResumeFile");
              // console.log(arf.metaData());
              expect(arf).to.be.ok();
              expect(arf.size()).to.be(4);
              expect(arf.ownerId()).to.be.ok();
              // console.log(ja.get("applicantResumeFile"));
              file.destroy().then(function(){
                done();
              }, function(error){
                done(error);
              });
            },
            error: function(object, error) {
              done(error);
            }
          });

        }, function(obj, error){
          done(error);
        });
      }, function(error){
        done(error);
      });
    });
  });
});
