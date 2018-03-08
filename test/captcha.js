describe('Captcha', () => {
  before(function() {
    return AV.Captcha.request().then(captcha => {
      this.captcha = captcha;
    });
  });
  it('.request', function() {
    this.captcha.should.be.instanceof(AV.Captcha);
    this.captcha.url.should.be.a.String();
    this.captcha.captchaToken.should.be.a.String();
  });
  it('.refresh', function() {
    const currentUrl = this.captcha.url;
    return this.captcha.refresh().then(() => {
      this.captcha.url.should.not.equalTo(currentUrl);
    });
  });
  it('.refresh', function() {
    return this.captcha.verify('fakecode').should.be.rejected();
  });
});
